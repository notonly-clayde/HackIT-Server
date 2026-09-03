import type { ILobbyRepository } from "../../domain/repositories/lobby.repository.js"
import type { IProblemRepository } from "../../domain/repositories/problem.repository.js"
import type { ITournamentProblemRepository } from "../../domain/repositories/tournament-problem.repository.js"
import type { ITournamentRepository } from "../../domain/repositories/tournament.repository.js"
import type { IUserRepository } from "../../domain/repositories/user.repository.js"
import type { ProblemService } from "./problem.service.js"
import type { TournamentLiveService } from "./tournament-live.service.js"
import type {
  AttachProblemDto,
  ReorderTournamentProblemsDto,
  UpdateTournamentProblemDto,
} from "../dto/problem.dto.js"
import type { TournamentProblemSetNotifier } from "../../shared/realtime/tournament-problem-set-notifier.js"
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_TARGET_TYPES,
} from "../../domain/entities/activity-log.entity.js"
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../shared/errors/app-error.js"
import { isUserEmailVerified } from "../../shared/auth/email-verified.js"
import { toPlayerProblemDetailDto } from "../mappers/problem.mapper.js"
import type { TournamentWithHost } from "../../domain/entities/tournament.entity.js"
import type { ActivityLogService } from "./activity-log.service.js"

export class TournamentProblemService {
  constructor(
    private readonly tournamentRepository: ITournamentRepository,
    private readonly tournamentProblemRepository: ITournamentProblemRepository,
    private readonly problemRepository: IProblemRepository,
    private readonly problemService: ProblemService,
    private readonly userRepository: IUserRepository,
    private readonly tournamentLiveService: TournamentLiveService,
    private readonly lobbyRepository: ILobbyRepository,
    private readonly problemSetNotifier: TournamentProblemSetNotifier,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async listForViewer(tournamentId: string, viewerId: string) {
    const tournament = await this.tournamentRepository.findByIdWithHost(tournamentId)
    if (!tournament) {
      throw new NotFoundError("Tournament not found")
    }

    const isHost = tournament.hostId === viewerId
    const participantRole = isHost
      ? null
      : await this.lobbyRepository.findParticipantRole(tournamentId, viewerId)
    const isEnrolled = participantRole === "MOD" || participantRole === "PLAYER"

    if (!isHost && isEnrolled && tournament.status === "LIVE") {
      await this.tournamentLiveService.assertPlayAccess(tournamentId, viewerId)
    }

    const canListProblems =
      isHost || tournament.status === "LIVE" || tournament.status === "ENDED"

    const entries = canListProblems
      ? await this.tournamentProblemRepository.findByTournamentId(tournamentId)
      : []

    return {
      entries,
      isHost,
      status: tournament.status,
      viewerRole: isHost
        ? ("host" as const)
        : participantRole === "MOD"
          ? ("mod" as const)
          : participantRole === "PLAYER"
            ? ("player" as const)
            : null,
    }
  }

  async attach(
    tournamentId: string,
    hostId: string,
    emailVerified: boolean,
    input: AttachProblemDto,
  ) {
    const tournament = await this.requireHostAttachable(tournamentId, hostId)

    let problemId = input.problemId

    if (!problemId && input.problem) {
      const created = await this.problemService.create(hostId, emailVerified, input.problem)
      problemId = created.id
    }

    if (!problemId) {
      throw new BadRequestError("Either problemId or problem is required")
    }

    const problem = await this.problemRepository.findById(problemId)
    if (!problem) {
      throw new NotFoundError("Problem not found")
    }

    if (!this.problemService.canAttachToTournament(problem, hostId)) {
      throw new ForbiddenError("You cannot attach this problem to the tournament")
    }

    if (tournament.status === "LIVE") {
      const hiddenCount = problem.testCases.filter((test) => !test.isSample).length
      if (hiddenCount === 0) {
        throw new BadRequestError("Problem must have at least one hidden test case")
      }
    }

    const existing = await this.tournamentProblemRepository.findByTournamentId(tournamentId)
    if (existing.some((entry) => entry.problemId === problemId)) {
      throw new BadRequestError("Problem is already attached to this tournament")
    }

    const order = existing.length
    await this.tournamentProblemRepository.attach(tournamentId, problemId, order, input.points)

    const entries = await this.tournamentProblemRepository.findByTournamentId(tournamentId)

    if (tournament.status === "LIVE") {
      this.problemSetNotifier.notify({
        tournamentId,
        problems: entries.map((entry) => ({
          problemId: entry.problemId,
          order: entry.order,
          points: entry.points,
          problem: toPlayerProblemDetailDto(entry.problem),
        })),
      })
    }

    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.TOURNAMENT_PROBLEM_ATTACHED,
      actorId: hostId,
      targetType: ACTIVITY_TARGET_TYPES.PROBLEM,
      targetId: problemId,
      tournamentId,
      summary: `Problem attached to tournament: ${problem.title}`,
      metadata: { points: input.points, order },
    })

    return entries
  }

  async detach(tournamentId: string, hostId: string, emailVerified: boolean, problemId: string) {
    await this.requireHostEditable(tournamentId, hostId)

    const existing = await this.tournamentProblemRepository.findByTournamentId(tournamentId)
    if (!existing.some((entry) => entry.problemId === problemId)) {
      throw new NotFoundError("Problem is not attached to this tournament")
    }

    const entries = await this.tournamentProblemRepository.detach(tournamentId, problemId)

    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.TOURNAMENT_PROBLEM_DETACHED,
      actorId: hostId,
      targetType: ACTIVITY_TARGET_TYPES.PROBLEM,
      targetId: problemId,
      tournamentId,
      summary: `Problem detached from tournament`,
    })

    return entries
  }

  async updateEntry(
    tournamentId: string,
    hostId: string,
    emailVerified: boolean,
    problemId: string,
    input: UpdateTournamentProblemDto,
  ) {
    await this.requireHostEditable(tournamentId, hostId)

    const existing = await this.tournamentProblemRepository.findByTournamentId(tournamentId)
    if (!existing.some((entry) => entry.problemId === problemId)) {
      throw new NotFoundError("Problem is not attached to this tournament")
    }

    const entry = await this.tournamentProblemRepository.updateEntry(tournamentId, problemId, input)

    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.TOURNAMENT_PROBLEM_UPDATED,
      actorId: hostId,
      targetType: ACTIVITY_TARGET_TYPES.PROBLEM,
      targetId: problemId,
      tournamentId,
      summary: `Tournament problem entry updated`,
      metadata: { ...input },
    })

    return entry
  }

  async reorder(
    tournamentId: string,
    hostId: string,
    emailVerified: boolean,
    input: ReorderTournamentProblemsDto,
  ) {
    await this.requireHostEditable(tournamentId, hostId)
    const entries = await this.tournamentProblemRepository.reorder(tournamentId, input.order)

    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.TOURNAMENT_PROBLEM_REORDERED,
      actorId: hostId,
      targetType: ACTIVITY_TARGET_TYPES.TOURNAMENT,
      targetId: tournamentId,
      tournamentId,
      summary: `Tournament problems reordered`,
      metadata: { order: input.order },
    })

    return entries
  }

  private async requireHost(hostId: string, tournamentId: string): Promise<TournamentWithHost> {
    const user = await this.userRepository.findById(hostId)
    if (!user) {
      throw new BadRequestError("User profile not found. Call /api/auth/bootstrap first.")
    }

    if (!isUserEmailVerified(user)) {
      throw new ForbiddenError("Verified email required")
    }

    const tournament = await this.tournamentRepository.findByIdWithHost(tournamentId)
    if (!tournament) {
      throw new NotFoundError("Tournament not found")
    }

    if (tournament.hostId !== hostId) {
      throw new ForbiddenError("Only the host can manage tournament problems")
    }

    return tournament
  }

  private async requireHostAttachable(tournamentId: string, hostId: string) {
    const tournament = await this.requireHost(hostId, tournamentId)

    if (tournament.status === "OPEN" || tournament.status === "SOON") {
      return tournament
    }

    if (tournament.status === "LIVE" && tournament.pausedAt && !tournament.endedAt) {
      return tournament
    }

    throw new ForbiddenError(
      "Tournament problems can only be attached while Open, Soon, or while Live is paused",
    )
  }

  private async requireHostEditable(tournamentId: string, hostId: string) {
    const tournament = await this.requireHost(hostId, tournamentId)

    if (tournament.status !== "OPEN" && tournament.status !== "SOON") {
      throw new ForbiddenError("Tournament problems can only be changed while Open or Soon")
    }

    return tournament
  }
}
