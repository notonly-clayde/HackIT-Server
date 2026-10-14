import type { ILobbyRepository } from "../../domain/repositories/lobby.repository.js"
import type { ITournamentDisciplineRepository } from "../../domain/repositories/tournament-discipline.repository.js"
import type { IUserRepository } from "../../domain/repositories/user.repository.js"
import type { TournamentWithHost } from "../../domain/entities/tournament.entity.js"
import type { LobbyPlayer } from "../../domain/entities/lobby.entity.js"
import type {
  TournamentSuspensionRequestRecord,
  TournamentWarningRecord,
} from "../../domain/entities/tournament-discipline.entity.js"
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_TARGET_TYPES,
} from "../../domain/entities/activity-log.entity.js"
import { BadRequestError, ForbiddenError, NotFoundError } from "../../shared/errors/app-error.js"
import type { TournamentDisciplineNotifier } from "../../shared/realtime/tournament-discipline-notifier.js"
import type { TournamentStandingsNotifier } from "../../shared/realtime/tournament-standings-notifier.js"
import type { ActivityLogService } from "./activity-log.service.js"
import type { StandingsService } from "./standings.service.js"
import type { TournamentLiveService } from "./tournament-live.service.js"

type StaffRole = "host" | "mod"

export class TournamentDisciplineService {
  constructor(
    private readonly tournamentLiveService: TournamentLiveService,
    private readonly lobbyRepository: ILobbyRepository,
    private readonly disciplineRepository: ITournamentDisciplineRepository,
    private readonly userRepository: IUserRepository,
    private readonly standingsService: StandingsService,
    private readonly standingsNotifier: TournamentStandingsNotifier,
    private readonly disciplineNotifier: TournamentDisciplineNotifier,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async list(tournamentId: string, viewerId: string): Promise<{
    warnings: TournamentWarningRecord[]
    suspensionRequests: TournamentSuspensionRequestRecord[]
  }> {
    await this.requireStaff(tournamentId, viewerId)
    const [warnings, suspensionRequests] = await Promise.all([
      this.disciplineRepository.listWarnings(tournamentId),
      this.disciplineRepository.listSuspensionRequests(tournamentId),
    ])
    return { warnings, suspensionRequests }
  }

  async warn(tournamentId: string, actorId: string, playerId: string, reason: string) {
    const { tournament } = await this.requireLiveStaff(tournamentId, actorId)
    const player = await this.requireActivePlayer(tournament.id, playerId)
    const actorName = await this.displayName(actorId)

    const warning = await this.disciplineRepository.createWarning({
      tournamentId,
      playerId,
      issuedById: actorId,
      reason,
    })

    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.TOURNAMENT_PLAYER_WARNED,
      actorId,
      targetType: ACTIVITY_TARGET_TYPES.USER,
      targetId: playerId,
      tournamentId,
      summary: `Warned ${player.displayName}: ${reason}`,
      metadata: { warningId: warning.id, reason },
    })

    this.disciplineNotifier.notifyWarned({
      tournamentId,
      playerId,
      reason,
      issuedBy: actorName,
      at: warning.createdAt.toISOString(),
    })
    this.disciplineNotifier.notifyUpdated(tournamentId)

    return warning
  }

  async requestSuspension(tournamentId: string, actorId: string, playerId: string, reason: string) {
    const { role } = await this.requireLiveStaff(tournamentId, actorId)
    if (role !== "mod") {
      throw new ForbiddenError("Hosts disqualify players directly")
    }

    const player = await this.requireActivePlayer(tournamentId, playerId)

    if (await this.disciplineRepository.hasPendingSuspensionRequest(tournamentId, playerId)) {
      throw new BadRequestError("A suspension request for this player is already pending")
    }

    const request = await this.disciplineRepository.createSuspensionRequest({
      tournamentId,
      playerId,
      requestedById: actorId,
      reason,
    })

    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.TOURNAMENT_SUSPENSION_REQUESTED,
      actorId,
      targetType: ACTIVITY_TARGET_TYPES.USER,
      targetId: playerId,
      tournamentId,
      summary: `Requested suspension of ${player.displayName}: ${reason}`,
      metadata: { requestId: request.id, reason },
    })

    this.disciplineNotifier.notifyUpdated(tournamentId)
    return request
  }

  async approve(tournamentId: string, actorId: string, requestId: string, note: string | null) {
    await this.requireLiveHost(tournamentId, actorId)
    const request = await this.requirePendingRequest(tournamentId, requestId)
    await this.requireActivePlayer(tournamentId, request.playerId)

    return this.applyDisqualification({
      tournamentId,
      actorId,
      playerId: request.playerId,
      reason: request.reason,
      requestId,
      note,
    })
  }

  async reject(tournamentId: string, actorId: string, requestId: string, note: string | null) {
    await this.requireLiveHost(tournamentId, actorId)
    await this.requirePendingRequest(tournamentId, requestId)

    const rejected = await this.disciplineRepository.rejectSuspensionRequest(requestId, actorId, note)
    if (!rejected) {
      throw new BadRequestError("This request has already been decided")
    }

    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.TOURNAMENT_SUSPENSION_REJECTED,
      actorId,
      targetType: ACTIVITY_TARGET_TYPES.USER,
      targetId: rejected.playerId,
      tournamentId,
      summary: `Rejected suspension request for ${rejected.playerDisplayName}`,
      metadata: { requestId, note },
    })

    this.disciplineNotifier.notifyUpdated(tournamentId)
    return rejected
  }

  async disqualify(tournamentId: string, actorId: string, playerId: string, reason: string) {
    await this.requireLiveHost(tournamentId, actorId)
    await this.requireActivePlayer(tournamentId, playerId)

    return this.applyDisqualification({
      tournamentId,
      actorId,
      playerId,
      reason,
      requestId: null,
      note: null,
    })
  }

  private async applyDisqualification(input: {
    tournamentId: string
    actorId: string
    playerId: string
    reason: string
    requestId: string | null
    note: string | null
  }) {
    const record = await this.disciplineRepository.disqualify({
      tournamentId: input.tournamentId,
      playerId: input.playerId,
      decidedById: input.actorId,
      reason: input.reason,
      requestId: input.requestId,
      decisionNote: input.note,
    })

    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.TOURNAMENT_PLAYER_DISQUALIFIED,
      actorId: input.actorId,
      targetType: ACTIVITY_TARGET_TYPES.USER,
      targetId: input.playerId,
      tournamentId: input.tournamentId,
      summary: `Disqualified ${record.playerDisplayName}: ${input.reason}`,
      metadata: { requestId: record.id, reason: input.reason },
    })

    this.disciplineNotifier.notifyDisqualified({
      tournamentId: input.tournamentId,
      playerId: input.playerId,
      reason: input.reason,
      at: new Date().toISOString(),
    })
    this.disciplineNotifier.notifyUpdated(input.tournamentId)

    const standings = await this.standingsService.getStandings(input.tournamentId)
    this.standingsNotifier.notify(standings)

    return record
  }

  private async requireStaff(
    tournamentId: string,
    userId: string,
  ): Promise<{ tournament: TournamentWithHost; role: StaffRole }> {
    const tournament = await this.tournamentLiveService.getTournamentMaybeFinalized(tournamentId)
    if (!tournament) throw new NotFoundError("Tournament not found")

    const role = await this.tournamentLiveService.resolveViewerRole(tournament, userId)
    if (role !== "host" && role !== "mod") {
      throw new ForbiddenError("Only the host and moderators can manage player discipline")
    }

    return { tournament, role }
  }

  private async requireLiveStaff(tournamentId: string, userId: string) {
    const result = await this.requireStaff(tournamentId, userId)
    if (result.tournament.status !== "LIVE") {
      throw new BadRequestError("Discipline actions are only available while the tournament is live")
    }
    return result
  }

  private async requireLiveHost(tournamentId: string, userId: string) {
    const result = await this.requireLiveStaff(tournamentId, userId)
    if (result.role !== "host") {
      throw new ForbiddenError("Only the host can decide on suspensions")
    }
    return result
  }

  private async requireActivePlayer(tournamentId: string, playerId: string): Promise<LobbyPlayer> {
    const player = await this.lobbyRepository.findPlayer(tournamentId, playerId)
    if (!player || player.role !== "player") {
      throw new NotFoundError("Player is not enrolled in this tournament")
    }
    if (player.disqualifiedAt) {
      throw new BadRequestError("Player is already disqualified")
    }
    return player
  }

  private async requirePendingRequest(tournamentId: string, requestId: string) {
    const request = await this.disciplineRepository.findSuspensionRequest(requestId)
    if (!request || request.tournamentId !== tournamentId) {
      throw new NotFoundError("Suspension request not found")
    }
    if (request.status !== "PENDING") {
      throw new BadRequestError("This request has already been decided")
    }
    return request
  }

  private async displayName(userId: string): Promise<string> {
    const user = await this.userRepository.findById(userId)
    return user?.displayName ?? "Staff"
  }
}
