import bcrypt from "bcryptjs"
import {
  isMatchReady,
  type MatchWithPlayers,
  type ReadyMatch,
  type SubmissionVerdict,
} from "../../domain/entities/match.entity.js"
import type { ProblemDifficulty } from "../../domain/entities/problem.entity.js"
import type { User } from "../../domain/entities/user.entity.js"
import type { IMatchRepository } from "../../domain/repositories/match.repository.js"
import type { IProblemRepository } from "../../domain/repositories/problem.repository.js"
import type { IUserRepository } from "../../domain/repositories/user.repository.js"
import type { SubmitSolutionDto, SubmissionResultDto, RunSolutionResultDto } from "../dto/submission.dto.js"
import type {
  CreateVersusRoomDto,
  JoinVersusRoomDto,
  VersusMatchDto,
  VersusMatchEndedDto,
  VersusReviewDto,
  VersusSubmissionResultDto,
} from "../dto/versus.dto.js"
import { toPlayerProblemDetailDto } from "../mappers/problem.mapper.js"
import { toVersusMatchDto } from "../mappers/versus.mapper.js"
import { CodeJudgeService } from "./code-judge.service.js"
import {
  applyEloDelta,
  ELO_K_BY_DIFFICULTY,
  MATCH_DURATION_BY_DIFFICULTY,
  MATCH_LOBBY_SECONDS,
} from "../../shared/versus/elo.js"
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../../shared/errors/app-error.js"
import type { VersusMatchNotifier } from "../../shared/realtime/versus-match-notifier.js"

const BCRYPT_ROUNDS = 10

const DIFFICULTY_BY_LABEL: Record<CreateVersusRoomDto["difficulty"], ProblemDifficulty> = {
  easy: "EASY",
  medium: "MEDIUM",
  hard: "HARD",
}

/** Waiting private rooms must never be auto-promoted by the lobby timer; the real deadline is set on join. */
const WAITING_ROOM_LOBBY_ENDS_AT = new Date("9999-12-31T00:00:00.000Z")

export class VersusService {
  private readonly judge = new CodeJudgeService()

  constructor(
    private readonly matchRepository: IMatchRepository,
    private readonly problemRepository: IProblemRepository,
    private readonly userRepository: IUserRepository,
    private readonly matchNotifier: VersusMatchNotifier,
  ) {}

  async assertPoolHasProblems(difficulty: ProblemDifficulty): Promise<void> {
    const problem = await this.pickRandomProblem(difficulty)
    if (!problem) {
      throw new BadRequestError(
        `No public ${difficulty.toLowerCase()} problems with hidden tests are available yet`,
      )
    }
  }

  async createLobbyMatch(
    playerAId: string,
    playerBId: string,
    difficulty: ProblemDifficulty,
  ): Promise<ReadyMatch> {
    const [playerA, playerB] = await Promise.all([
      this.userRepository.findById(playerAId),
      this.userRepository.findById(playerBId),
    ])

    if (!playerA || !playerB) {
      throw new NotFoundError("Player not found")
    }

    const problem = await this.pickRandomProblem(difficulty)
    if (!problem) {
      throw new BadRequestError(
        `No public ${difficulty.toLowerCase()} problems with hidden tests are available yet`,
      )
    }

    const now = new Date()
    const match = await this.matchRepository.create({
      playerAId,
      playerBId,
      problemId: problem.id,
      difficulty,
      durationMinutes: MATCH_DURATION_BY_DIFFICULTY[difficulty],
      lobbyEndsAt: new Date(now.getTime() + MATCH_LOBBY_SECONDS * 1000),
      playerAEloBefore: playerA.elo1v1,
      playerBEloBefore: playerB.elo1v1,
    })

    if (!isMatchReady(match)) throw new Error("Created ranked match is missing player B")
    return match
  }

  async createPrivateRoom(hostId: string, input: CreateVersusRoomDto): Promise<VersusMatchDto> {
    const host = await this.requireActiveUser(hostId)
    const difficulty = DIFFICULTY_BY_LABEL[input.difficulty]

    const problem = await this.pickRandomProblem(difficulty)
    if (!problem) {
      throw new BadRequestError(
        `No public ${difficulty.toLowerCase()} problems with hidden tests are available yet`,
      )
    }

    const match = await this.matchRepository.create({
      kind: "PRIVATE",
      lobbyName: input.lobbyName || null,
      passwordHash: input.password ? await bcrypt.hash(input.password, BCRYPT_ROUNDS) : null,
      playerAId: host.id,
      playerBId: null,
      problemId: problem.id,
      difficulty,
      durationMinutes: MATCH_DURATION_BY_DIFFICULTY[difficulty],
      lobbyEndsAt: WAITING_ROOM_LOBBY_ENDS_AT,
      playerAEloBefore: host.elo1v1,
      playerBEloBefore: null,
    })

    return toVersusMatchDto(match, host.id)
  }

  async joinPrivateRoom(
    matchId: string,
    userId: string,
    input: JoinVersusRoomDto,
  ): Promise<VersusMatchDto> {
    const guest = await this.requireActiveUser(userId)
    const room = await this.matchRepository.findById(matchId)
    if (!room || room.kind !== "PRIVATE") {
      throw new NotFoundError("Room not found")
    }
    if (room.playerBId === userId) {
      return toVersusMatchDto(room, userId)
    }
    if (room.playerAId === userId) {
      throw new BadRequestError("You are the host of this room")
    }
    if (room.status !== "LOBBY") {
      throw new BadRequestError("This room is no longer open")
    }
    if (room.playerBId) {
      throw new BadRequestError("This room is full")
    }
    if (room.passwordHash) {
      if (!input.password) {
        throw new UnauthorizedError("This room requires a password")
      }
      const valid = await bcrypt.compare(input.password, room.passwordHash)
      if (!valid) {
        throw new UnauthorizedError("Incorrect room password")
      }
    }

    const joined = await this.matchRepository.attachPlayerB(matchId, {
      playerBId: guest.id,
      playerAEloBefore: room.playerA.elo1v1,
      playerBEloBefore: guest.elo1v1,
      lobbyEndsAt: new Date(Date.now() + MATCH_LOBBY_SECONDS * 1000),
    })
    if (!joined || !isMatchReady(joined)) {
      throw new BadRequestError("This room is no longer open")
    }

    this.matchNotifier.notifyLobbyReady(joined)
    return toVersusMatchDto(joined, userId)
  }

  async getMatch(matchId: string, userId: string): Promise<VersusMatchDto> {
    const match = await this.requireParticipant(matchId, userId)
    const solveElapsedMinutes = await this.resolveSolveMinutes(match)
    return toVersusMatchDto(match, userId, { solveElapsedMinutes })
  }

  async getReview(matchId: string, userId: string): Promise<VersusReviewDto> {
    const match = await this.requireParticipant(matchId, userId)
    if (match.status !== "ENDED" || !isMatchReady(match)) {
      throw new ForbiddenError("Match review is available after the match ends")
    }

    const submissions = await this.matchRepository.findLatestSubmissions(matchId)
    const you = match.playerAId === userId ? match.playerA : match.playerB
    const opponent = match.playerAId === userId ? match.playerB : match.playerA
    const yourSub = submissions.find((item) => item.userId === you.id) ?? null
    const oppSub = submissions.find((item) => item.userId === opponent.id) ?? null

    const mapSub = (sub: (typeof submissions)[number] | null, player: User) =>
      sub
        ? {
            userId: player.id,
            displayName: player.displayName,
            language: sub.language,
            sourceCode: sub.sourceCode,
            verdict: sub.verdict.toLowerCase(),
            effectiveElapsedMinutes: sub.effectiveElapsedMinutes,
            submittedAt: sub.submittedAt.toISOString(),
          }
        : null

    return {
      matchId: match.id,
      problem: toPlayerProblemDetailDto(match.problem),
      you: mapSub(yourSub, you),
      opponent: mapSub(oppSub, opponent),
    }
  }

  async startLive(matchId: string): Promise<MatchWithPlayers | null> {
    const startedAt = new Date()
    const match = await this.matchRepository.startLive(matchId, startedAt)
    if (!match || !isMatchReady(match)) return null

    try {
      this.matchNotifier.notifyStarted({
        matchId: match.id,
        status: "live",
        startedAt: startedAt.toISOString(),
        playerAId: match.playerAId,
        playerBId: match.playerBId,
      })

      for (const playerId of [match.playerAId, match.playerBId]) {
        this.matchNotifier.notifyState(toVersusMatchDto(match, playerId))
      }
    } catch (error) {
      console.error(`[versus] failed to notify start for match ${matchId}`, error)
    }

    return match
  }

  async leave(matchId: string, userId: string): Promise<VersusMatchEndedDto> {
    const match = await this.requireParticipant(matchId, userId)
    if (match.status === "ENDED" || match.status === "ABORTED") {
      return this.toEndedDto(match, userId)
    }

    if (match.status === "LOBBY" || !isMatchReady(match)) {
      const aborted = await this.abortMatch(match)
      return this.toEndedDto(aborted, userId)
    }

    const winnerId = match.playerAId === userId ? match.playerBId : match.playerAId
    const settled = await this.settleMatch(match, winnerId, "forfeit")
    return this.toEndedDto(settled, userId)
  }

  async run(
    userId: string,
    matchId: string,
    input: SubmitSolutionDto,
  ): Promise<RunSolutionResultDto> {
    const match = await this.requireLiveParticipant(matchId, userId)
    const sampleTests = match.problem.testCases
      .filter((test) => test.isSample)
      .sort((a, b) => a.order - b.order)
      .map((test) => ({ input: test.input, expectedOutput: test.expectedOutput }))

    return this.judge.judge(input.language, input.sourceCode, sampleTests, match.problem.timeLimitMs)
  }

  async submit(
    userId: string,
    matchId: string,
    input: SubmitSolutionDto,
  ): Promise<VersusSubmissionResultDto> {
    const match = await this.requireLiveParticipant(matchId, userId)

    const hiddenTests = match.problem.testCases
      .filter((test) => !test.isSample)
      .sort((a, b) => a.order - b.order)
      .map((test) => ({ input: test.input, expectedOutput: test.expectedOutput }))

    if (hiddenTests.length === 0) {
      throw new BadRequestError("Problem has no hidden test cases")
    }

    const verdict = await this.judge.judge(
      input.language,
      input.sourceCode,
      hiddenTests,
      match.problem.timeLimitMs,
    )

    const mappedVerdict = mapJudgeStatusToVerdict(verdict.status)
    const submittedAt = new Date()
    const effectiveElapsedMinutes = match.startedAt
      ? Math.max(0, Math.floor((submittedAt.getTime() - match.startedAt.getTime()) / 60_000))
      : 0

    await this.matchRepository.createSubmission({
      matchId,
      userId,
      problemId: match.problemId,
      language: input.language,
      sourceCode: input.sourceCode,
      verdict: mappedVerdict,
      effectiveElapsedMinutes,
    })

    if (mappedVerdict !== "ACCEPTED") {
      return verdict
    }

    const settled = await this.settleMatch(match, userId, "first_ac")
    return {
      ...verdict,
      matchEnded: await this.toEndedDto(settled, userId),
    }
  }

  async recoverActiveMatches(): Promise<void> {
    const now = Date.now()
    const [lobbyMatches, liveMatches] = await Promise.all([
      this.matchRepository.findByStatus("LOBBY"),
      this.matchRepository.findByStatus("LIVE"),
    ])

    for (const match of lobbyMatches) {
      if (match.lobbyEndsAt.getTime() <= now) {
        try {
          await this.startLive(match.id)
        } catch (error) {
          console.error(`[versus] failed to promote lobby match ${match.id}`, error)
        }
      }
    }

    for (const match of liveMatches) {
      if (!match.startedAt || !isMatchReady(match)) continue
      const endsAt = match.startedAt.getTime() + match.durationMinutes * 60_000
      if (endsAt <= now) {
        try {
          await this.timeoutMatch(match)
        } catch (error) {
          console.error(`[versus] failed to timeout match ${match.id}`, error)
        }
      }
    }
  }

  async tickActiveMatches(): Promise<void> {
    await this.recoverActiveMatches()
  }

  private async timeoutMatch(match: ReadyMatch): Promise<void> {
    const hasAccepted = await this.matchRepository.hasAccepted(match.id)
    if (hasAccepted) return
    await this.settleMatch(match, null, "timeout")
  }

  async agreeDraw(matchId: string, userId: string): Promise<VersusMatchEndedDto> {
    const match = await this.requireLiveParticipant(matchId, userId)
    const settled = await this.settleMatch(match, null, "agreed_draw")
    return this.toEndedDto(settled, userId)
  }

  /** Cancel a lobby match with no winner, loser, tie, or ELO change. */
  private async abortMatch(match: MatchWithPlayers): Promise<MatchWithPlayers> {
    if (match.status === "ABORTED" || match.status === "ENDED") {
      return match
    }

    const settled = await this.matchRepository.settle(match.id, ["LOBBY"], {
      winnerId: null,
      playerAEloAfter: match.playerAEloBefore,
      playerBEloAfter: match.playerBEloBefore,
      endedAt: new Date(),
      status: "ABORTED",
      endedReason: "abort",
    })

    if (!settled) {
      const fresh = await this.matchRepository.findById(match.id)
      if (!fresh) throw new NotFoundError("Match not found")
      return fresh
    }

    for (const playerId of [settled.playerAId, settled.playerBId]) {
      if (!playerId) continue
      const dto = await this.toEndedDto(settled, playerId)
      this.matchNotifier.notifyEnded(dto)
      this.matchNotifier.notifyState(dto.match)
    }

    return settled
  }

  private async settleMatch(
    match: ReadyMatch,
    winnerId: string | null,
    endedReason: "first_ac" | "timeout" | "forfeit" | "agreed_draw",
  ): Promise<MatchWithPlayers> {
    if (match.status === "ENDED" || match.status === "ABORTED") {
      return match
    }

    const k = ELO_K_BY_DIFFICULTY[match.difficulty]
    const aBefore = match.playerAEloBefore
    const bBefore = match.playerBEloBefore

    let aScore: 0 | 0.5 | 1 = 0.5
    let bScore: 0 | 0.5 | 1 = 0.5
    if (winnerId === match.playerAId) {
      aScore = 1
      bScore = 0
    } else if (winnerId === match.playerBId) {
      aScore = 0
      bScore = 1
    }

    const aAfter = applyEloDelta(aBefore, bBefore, aScore, k)
    const bAfter = applyEloDelta(bBefore, aBefore, bScore, k)

    const settled = await this.matchRepository.settle(
      match.id,
      ["LIVE"],
      {
        winnerId,
        playerAEloAfter: aAfter,
        playerBEloAfter: bAfter,
        endedAt: new Date(),
        status: "ENDED",
        endedReason,
      },
    )

    if (!settled || !isMatchReady(settled)) {
      const fresh = await this.matchRepository.findById(match.id)
      if (!fresh) throw new NotFoundError("Match not found")
      return fresh
    }

    await this.applyPlayerStats(settled.playerA, aAfter, winnerId === settled.playerAId, winnerId === null)
    await this.applyPlayerStats(settled.playerB, bAfter, winnerId === settled.playerBId, winnerId === null)

    const refreshed = (await this.matchRepository.findById(settled.id)) ?? settled

    for (const playerId of [settled.playerAId, settled.playerBId]) {
      const dto = await this.toEndedDto(refreshed, playerId)
      this.matchNotifier.notifyEnded(dto)
      this.matchNotifier.notifyState(dto.match)
    }

    return refreshed
  }

  private async applyPlayerStats(
    user: User,
    newElo: number,
    won: boolean,
    draw: boolean,
  ): Promise<void> {
    await this.userRepository.updateMatchStats(user.id, {
      elo1v1: newElo,
      peakElo1v1: Math.max(user.peakElo1v1, user.elo1v1, newElo),
      winStreak1v1: won ? user.winStreak1v1 + 1 : 0,
      wins: won ? user.wins + 1 : user.wins,
      draws: draw ? user.draws + 1 : user.draws,
      matchCount: user.matchCount + 1,
    })
  }

  private async toEndedDto(match: MatchWithPlayers, userId: string): Promise<VersusMatchEndedDto> {
    const solveElapsedMinutes = await this.resolveSolveMinutes(match)
    const matchDto = toVersusMatchDto(match, userId, { solveElapsedMinutes })
    const isA = match.playerAId === userId
    const before = (isA ? match.playerAEloBefore : match.playerBEloBefore) ?? 0
    const after = (isA ? match.playerAEloAfter : match.playerBEloAfter) ?? before

    if (match.status === "ABORTED") {
      return {
        match: matchDto,
        result: "abort",
        yourEloDelta: 0,
        endedReason: "abort",
        solveElapsedMinutes: null,
      }
    }

    let result: "win" | "loss" | "draw" = "draw"
    if (match.winnerId === userId) result = "win"
    else if (match.winnerId) result = "loss"

    const endedReason =
      match.endedReason === "first_ac" ||
      match.endedReason === "timeout" ||
      match.endedReason === "forfeit" ||
      match.endedReason === "agreed_draw"
        ? match.endedReason
        : result === "draw"
          ? "timeout"
          : "first_ac"

    return {
      match: matchDto,
      result,
      yourEloDelta: after - before,
      endedReason,
      solveElapsedMinutes,
    }
  }

  private async resolveSolveMinutes(match: MatchWithPlayers): Promise<number | null> {
    if (!match.winnerId) return null
    const submissions = await this.matchRepository.findLatestSubmissions(match.id)
    const accepted = submissions.find(
      (item) => item.userId === match.winnerId && item.verdict === "ACCEPTED",
    )
    return accepted?.effectiveElapsedMinutes ?? null
  }

  private async pickRandomProblem(difficulty: ProblemDifficulty) {
    const problems = await this.problemRepository.findMany({
      visibility: "PUBLIC",
      difficulty,
    })
    const eligible = problems.filter((problem) => problem.testCases.some((test) => !test.isSample))
    if (eligible.length === 0) return null
    const index = Math.floor(Math.random() * eligible.length)
    return eligible[index] ?? null
  }

  private async requireParticipant(matchId: string, userId: string): Promise<MatchWithPlayers> {
    const match = await this.matchRepository.findById(matchId)
    if (!match) throw new NotFoundError("Match not found")
    if (match.playerAId !== userId && match.playerBId !== userId) {
      throw new ForbiddenError("You are not a participant in this match")
    }
    return match
  }

  private async requireActiveUser(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId)
    if (!user) throw new NotFoundError("User not found")
    if (user.status === "SUSPENDED") throw new ForbiddenError("Account suspended")
    return user
  }

  private async requireLiveParticipant(matchId: string, userId: string): Promise<ReadyMatch> {
    const match = await this.requireParticipant(matchId, userId)
    if (match.status === "LOBBY" || !isMatchReady(match)) {
      throw new BadRequestError("Match has not started yet")
    }
    if (match.status === "ENDED" || match.status === "ABORTED") {
      throw new BadRequestError("Match has ended")
    }
    if (!match.startedAt) {
      throw new BadRequestError("Match has not started yet")
    }
    const endsAt = match.startedAt.getTime() + match.durationMinutes * 60_000
    if (Date.now() >= endsAt) {
      await this.timeoutMatch(match)
      throw new BadRequestError("Match time has expired")
    }
    return match
  }
}

function mapJudgeStatusToVerdict(status: SubmissionResultDto["status"]): SubmissionVerdict {
  switch (status) {
    case "accepted":
      return "ACCEPTED"
    case "wrong_answer":
      return "WRONG_ANSWER"
    case "runtime_error":
      return "RUNTIME_ERROR"
    case "timeout":
      return "TIMEOUT"
    case "compile_error":
      return "COMPILE_ERROR"
    default:
      return "UNSUPPORTED"
  }
}
