import type { IProblemRepository } from "../../domain/repositories/problem.repository.js"
import type { ITournamentProblemRepository } from "../../domain/repositories/tournament-problem.repository.js"
import type { ITournamentRepository } from "../../domain/repositories/tournament.repository.js"
import type { ITournamentSubmissionRepository } from "../../domain/repositories/tournament-submission.repository.js"
import type { SubmissionVerdict } from "../../domain/entities/tournament-submission.entity.js"
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_TARGET_TYPES,
} from "../../domain/entities/activity-log.entity.js"
import type { TournamentLiveService } from "./tournament-live.service.js"
import type { StandingsService } from "./standings.service.js"
import type { SubmitSolutionDto, SubmissionResultDto, RunSolutionResultDto } from "../dto/submission.dto.js"
import { CodeJudgeService } from "./code-judge.service.js"
import { BadRequestError, ForbiddenError, NotFoundError } from "../../shared/errors/app-error.js"
import { computeEffectiveElapsedMinutes } from "../../shared/contest/compute-standings.js"
import type { TournamentStandingsNotifier } from "../../shared/realtime/tournament-standings-notifier.js"
import type { ActivityLogService } from "./activity-log.service.js"

export class SubmissionService {
  private readonly judge = new CodeJudgeService()

  constructor(
    private readonly problemRepository: IProblemRepository,
    private readonly tournamentRepository: ITournamentRepository,
    private readonly tournamentProblemRepository: ITournamentProblemRepository,
    private readonly tournamentSubmissionRepository: ITournamentSubmissionRepository,
    private readonly tournamentLiveService: TournamentLiveService,
    private readonly standingsService: StandingsService,
    private readonly standingsNotifier: TournamentStandingsNotifier,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async runPractice(
    userId: string,
    problemId: string,
    input: SubmitSolutionDto,
    isAdmin = false,
  ): Promise<RunSolutionResultDto> {
    const problem = await this.problemRepository.findById(problemId)
    if (!problem) {
      throw new NotFoundError("Problem not found")
    }

    if (problem.visibility !== "PUBLIC" && problem.authorId !== userId && !isAdmin) {
      throw new ForbiddenError("You do not have access to this problem")
    }

    const sampleTests = problem.testCases
      .filter((test) => test.isSample)
      .sort((a, b) => a.order - b.order)
      .map((test) => ({ input: test.input, expectedOutput: test.expectedOutput }))

    return this.judge.judge(input.language, input.sourceCode, sampleTests, problem.timeLimitMs)
  }

  async submitPractice(
    userId: string,
    problemId: string,
    input: SubmitSolutionDto,
    isAdmin = false,
  ): Promise<SubmissionResultDto> {
    const problem = await this.problemRepository.findById(problemId)
    if (!problem) {
      throw new NotFoundError("Problem not found")
    }

    if (problem.visibility !== "PUBLIC" && problem.authorId !== userId && !isAdmin) {
      throw new ForbiddenError("You do not have access to this problem")
    }

    const hiddenTests = problem.testCases
      .filter((test) => !test.isSample)
      .sort((a, b) => a.order - b.order)
      .map((test) => ({ input: test.input, expectedOutput: test.expectedOutput }))

    if (hiddenTests.length === 0) {
      throw new BadRequestError("Problem has no hidden test cases")
    }

    return this.judge.judge(input.language, input.sourceCode, hiddenTests, problem.timeLimitMs)
  }

  async runTournament(
    userId: string,
    tournamentId: string,
    problemId: string,
    input: SubmitSolutionDto,
  ): Promise<RunSolutionResultDto> {
    await this.tournamentLiveService.assertPlayAccess(tournamentId, userId)

    const tournament = await this.tournamentRepository.findByIdWithHost(tournamentId)
    if (!tournament) {
      throw new NotFoundError("Tournament not found")
    }

    const entries = await this.tournamentProblemRepository.findByTournamentId(tournamentId)
    const entry = entries.find((item) => item.problemId === problemId)
    if (!entry) {
      throw new NotFoundError("Problem not attached to this tournament")
    }

    const sampleTests = entry.problem.testCases
      .filter((test) => test.isSample)
      .sort((a, b) => a.order - b.order)
      .map((test) => ({ input: test.input, expectedOutput: test.expectedOutput }))

    return this.judge.judge(
      input.language,
      input.sourceCode,
      sampleTests,
      entry.problem.timeLimitMs,
    )
  }

  async submitTournament(
    userId: string,
    tournamentId: string,
    problemId: string,
    input: SubmitSolutionDto,
  ): Promise<SubmissionResultDto> {
    await this.tournamentLiveService.assertPlayAccess(tournamentId, userId)

    const tournament = await this.tournamentRepository.findByIdWithHost(tournamentId)
    if (!tournament) {
      throw new NotFoundError("Tournament not found")
    }

    const entries = await this.tournamentProblemRepository.findByTournamentId(tournamentId)
    const entry = entries.find((item) => item.problemId === problemId)
    if (!entry) {
      throw new NotFoundError("Problem not attached to this tournament")
    }

    const hiddenTests = entry.problem.testCases
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
      entry.problem.timeLimitMs,
    )

    const submittedAt = new Date()
    const effectiveElapsedMinutes = computeEffectiveElapsedMinutes({
      liveStartedAt: tournament.liveStartedAt,
      pausedTotalMs: tournament.pausedTotalMs,
      pausedAt: tournament.pausedAt,
      resumeAt: tournament.resumeAt,
      submittedAt,
    })

    const mappedVerdict = mapJudgeStatusToVerdict(verdict.status)

    const submission = await this.tournamentSubmissionRepository.create({
      tournamentId,
      userId,
      problemId,
      language: input.language,
      verdict: mappedVerdict,
      effectiveElapsedMinutes,
    })

    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.SUBMISSION_TOURNAMENT,
      actorId: userId,
      targetType: ACTIVITY_TARGET_TYPES.SUBMISSION,
      targetId: submission.id,
      tournamentId,
      summary: `Tournament submission: ${mappedVerdict}`,
      metadata: {
        verdict: mappedVerdict,
        language: input.language,
        problemId,
      },
    })

    const standings = await this.standingsService.getStandings(tournamentId)
    this.standingsNotifier.notify(standings)

    return {
      ...verdict,
      standings,
    }
  }
}

function mapJudgeStatusToVerdict(
  status: SubmissionResultDto["status"],
): SubmissionVerdict {
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
