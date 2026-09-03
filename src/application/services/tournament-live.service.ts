import type { ILobbyRepository } from "../../domain/repositories/lobby.repository.js"
import type { ITournamentProblemRepository } from "../../domain/repositories/tournament-problem.repository.js"
import type { ITournamentRepository } from "../../domain/repositories/tournament.repository.js"
import type { IUserRepository } from "../../domain/repositories/user.repository.js"
import type { TournamentWithHost } from "../../domain/entities/tournament.entity.js"
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_TARGET_TYPES,
} from "../../domain/entities/activity-log.entity.js"
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../shared/errors/app-error.js"
import { computeRemainingMs } from "../../shared/tournament/tournament-timer.js"
import { isUserEmailVerified } from "../../shared/auth/email-verified.js"
import type { ActivityLogService } from "./activity-log.service.js"

export const RESUME_COUNTDOWN_MS = 5000

export function isContestFrozen(tournament: Pick<TournamentWithHost, "pausedAt" | "endedAt">): boolean {
  return Boolean(tournament.pausedAt && !tournament.endedAt)
}

export class TournamentLiveService {
  constructor(
    private readonly tournamentRepository: ITournamentRepository,
    private readonly tournamentProblemRepository: ITournamentProblemRepository,
    private readonly lobbyRepository: ILobbyRepository,
    private readonly userRepository: IUserRepository,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async getTournamentMaybeFinalized(tournamentId: string): Promise<TournamentWithHost | null> {
    const tournament = await this.tournamentRepository.findByIdWithHost(tournamentId)
    if (!tournament) return null
    return this.finalizeLiveState(tournament)
  }

  async listLiveTournaments(): Promise<TournamentWithHost[]> {
    return this.tournamentRepository.findMany({ status: "Live" })
  }

  async expireByTimer(tournamentId: string): Promise<TournamentWithHost | null> {
    const tournament = await this.tournamentRepository.findByIdWithHost(tournamentId)
    if (!tournament) return null
    const previousStatus = tournament.status
    const result = await this.finalizeLiveState(tournament)

    if (previousStatus !== "ENDED" && result.status === "ENDED") {
      void this.activityLogService.record({
        action: ACTIVITY_ACTIONS.TOURNAMENT_ENDED,
        actorType: "SYSTEM",
        actorId: null,
        targetType: ACTIVITY_TARGET_TYPES.TOURNAMENT,
        targetId: result.id,
        tournamentId: result.id,
        summary: `Tournament ended by timer: ${result.name}`,
      })
    }

    return result
  }

  async finalizeLiveState(tournament: TournamentWithHost): Promise<TournamentWithHost> {
    tournament = await this.maybeFinalizeResume(tournament)
    return this.maybeExpireByTimer(tournament)
  }

  async maybeExpireByTimer(tournament: TournamentWithHost): Promise<TournamentWithHost> {
    if (tournament.status !== "LIVE") {
      return tournament
    }

    if (isContestFrozen(tournament)) {
      return tournament
    }

    const remaining = computeRemainingMs({
      durationMinutes: tournament.durationMinutes,
      liveStartedAt: tournament.liveStartedAt,
      pausedAt: tournament.pausedAt,
      pausedTotalMs: tournament.pausedTotalMs,
      endedAt: tournament.endedAt,
      status: tournament.status,
    })

    if (remaining === null || remaining > 0) {
      return tournament
    }

    return this.endLive(tournament)
  }

  async endLive(tournament: TournamentWithHost): Promise<TournamentWithHost> {
    const current = await this.tournamentRepository.findByIdWithHost(tournament.id)
    if (!current) {
      return tournament
    }

    if (current.status === "ENDED") {
      return current
    }

    if (current.status !== "LIVE") {
      return current
    }

    const now = new Date()
    let pausedTotalMs = current.pausedTotalMs

    if (current.pausedAt) {
      const pauseEnd = current.resumeAt ?? now
      pausedTotalMs += pauseEnd.getTime() - current.pausedAt.getTime()
    }

    return this.tournamentRepository.update(current.id, {
      status: "ENDED",
      endedAt: now,
      pausedAt: null,
      resumeAt: null,
      pausedTotalMs,
    })
  }

  async start(tournamentId: string, hostId: string) {
    const tournament = await this.requireHost(tournamentId, hostId)

    if (tournament.status !== "OPEN") {
      throw new BadRequestError("Tournament can only be started while Open")
    }

    const entries = await this.tournamentProblemRepository.findByTournamentId(tournamentId)
    if (entries.length === 0) {
      throw new BadRequestError("Attach at least one problem before starting")
    }

    const hiddenCount = await this.tournamentProblemRepository.countHiddenTests(tournamentId)
    if (hiddenCount === 0) {
      throw new BadRequestError("Each attached problem must have at least one hidden test case")
    }

    const updated = await this.tournamentRepository.update(tournamentId, {
      status: "LIVE",
      liveStartedAt: new Date(),
      pausedAt: null,
      resumeAt: null,
      pausedTotalMs: 0,
      endedAt: null,
    })

    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.TOURNAMENT_STARTED,
      actorId: hostId,
      targetType: ACTIVITY_TARGET_TYPES.TOURNAMENT,
      targetId: updated.id,
      tournamentId: updated.id,
      summary: `Tournament started: ${updated.name}`,
    })

    return updated
  }

  async pause(tournamentId: string, hostId: string) {
    const tournament = await this.requireHost(tournamentId, hostId)

    if (tournament.status !== "LIVE") {
      throw new BadRequestError("Tournament must be Live to pause")
    }

    if (tournament.pausedAt && !tournament.resumeAt) {
      throw new BadRequestError("Tournament is already paused")
    }

    const updated = await this.tournamentRepository.update(tournamentId, {
      pausedAt: new Date(),
      resumeAt: null,
    })

    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.TOURNAMENT_PAUSED,
      actorId: hostId,
      targetType: ACTIVITY_TARGET_TYPES.TOURNAMENT,
      targetId: updated.id,
      tournamentId: updated.id,
      summary: `Tournament paused: ${updated.name}`,
    })

    return updated
  }

  async resume(tournamentId: string, hostId: string) {
    const tournament = await this.requireHost(tournamentId, hostId)

    if (tournament.status !== "LIVE") {
      throw new BadRequestError("Tournament must be Live to resume")
    }

    if (!tournament.pausedAt) {
      throw new BadRequestError("Tournament is not paused")
    }

    if (tournament.resumeAt && tournament.resumeAt.getTime() > Date.now()) {
      throw new BadRequestError("Resume countdown is already in progress")
    }

    const resumeAt = new Date(Date.now() + RESUME_COUNTDOWN_MS)

    const updated = await this.tournamentRepository.update(tournamentId, { resumeAt })

    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.TOURNAMENT_RESUMED,
      actorId: hostId,
      targetType: ACTIVITY_TARGET_TYPES.TOURNAMENT,
      targetId: updated.id,
      tournamentId: updated.id,
      summary: `Tournament resumed: ${updated.name}`,
    })

    return updated
  }

  async finalizeResume(tournamentId: string) {
    const tournament = await this.tournamentRepository.findByIdWithHost(tournamentId)
    if (!tournament) {
      throw new NotFoundError("Tournament not found")
    }

    return this.maybeFinalizeResume(tournament)
  }

  async maybeFinalizeResume(tournament: TournamentWithHost): Promise<TournamentWithHost> {
    if (!tournament.pausedAt || !tournament.resumeAt) {
      return tournament
    }

    if (tournament.resumeAt.getTime() > Date.now()) {
      return tournament
    }

    const pausedTotalMs =
      tournament.pausedTotalMs + (tournament.resumeAt.getTime() - tournament.pausedAt.getTime())

    return this.tournamentRepository.update(tournament.id, {
      pausedAt: null,
      resumeAt: null,
      pausedTotalMs,
    })
  }

  async end(tournamentId: string, hostId: string) {
    const tournament = await this.requireHost(tournamentId, hostId)

    if (tournament.status !== "LIVE") {
      throw new BadRequestError("Tournament must be Live to end")
    }

    const result = await this.endLive(tournament)

    if (result.status === "ENDED") {
      void this.activityLogService.record({
        action: ACTIVITY_ACTIONS.TOURNAMENT_ENDED,
        actorId: hostId,
        targetType: ACTIVITY_TARGET_TYPES.TOURNAMENT,
        targetId: result.id,
        tournamentId: result.id,
        summary: `Tournament ended: ${result.name}`,
      })
    }

    return result
  }

  async assertPlayAccess(tournamentId: string, userId: string) {
    let tournament = await this.tournamentRepository.findByIdWithHost(tournamentId)
    if (!tournament) {
      throw new NotFoundError("Tournament not found")
    }

    tournament = await this.finalizeLiveState(tournament)

    if (tournament.hostId === userId) {
      throw new ForbiddenError("Host cannot enter as a player")
    }

    if (tournament.status !== "LIVE") {
      throw new ForbiddenError("Tournament is not live")
    }

    if (isContestFrozen(tournament)) {
      throw new ForbiddenError("Tournament is paused")
    }

    const role = await this.lobbyRepository.findParticipantRole(tournamentId, userId)
    if (!role) {
      throw new ForbiddenError("Only enrolled players can access the play arena. Spectate instead.")
    }

    return tournament
  }

  async resolveViewerRole(
    tournament: TournamentWithHost,
    userId: string | null,
  ): Promise<"host" | "player" | "mod" | null> {
    if (!userId) return null
    if (tournament.hostId === userId) return "host"

    const role = await this.lobbyRepository.findParticipantRole(tournament.id, userId)
    if (role === "MOD") return "mod"
    if (role === "PLAYER") return "player"
    return null
  }

  private async requireHost(tournamentId: string, hostId: string) {
    const user = await this.userRepository.findById(hostId)
    if (!user) {
      throw new BadRequestError("User profile not found. Call /api/auth/bootstrap first.")
    }

    if (!isUserEmailVerified(user)) {
      throw new ForbiddenError("Verified email required")
    }

    let tournament = await this.tournamentRepository.findByIdWithHost(tournamentId)
    if (!tournament) {
      throw new NotFoundError("Tournament not found")
    }

    tournament = await this.finalizeLiveState(tournament)

    if (tournament.hostId !== hostId) {
      throw new ForbiddenError("Only the host can control the live tournament")
    }

    return tournament
  }
}
