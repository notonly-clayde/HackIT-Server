import bcrypt from "bcryptjs"
import type { LobbyState } from "../../domain/entities/lobby.entity.js"
import type { ILobbyRepository } from "../../domain/repositories/lobby.repository.js"
import type { IUserRepository } from "../../domain/repositories/user.repository.js"
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_TARGET_TYPES,
} from "../../domain/entities/activity-log.entity.js"
import { resolveEmailVerified } from "../../shared/auth/email-verified.js"
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../../shared/errors/app-error.js"
import type { ActivityLogService } from "./activity-log.service.js"

export class LobbyService {
  constructor(
    private readonly lobbyRepository: ILobbyRepository,
    private readonly userRepository: IUserRepository,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async getLobbyState(tournamentId: string): Promise<LobbyState> {
    const state = await this.lobbyRepository.findLobbyState(tournamentId)

    if (!state) {
      throw new NotFoundError("Tournament not found")
    }

    return state
  }

  async join(
    tournamentId: string,
    userId: string,
    emailVerified: boolean,
    password?: string,
  ): Promise<LobbyState> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new BadRequestError("User profile not found. Call /api/auth/bootstrap first.")
    }

    if (!resolveEmailVerified(emailVerified, user.emailVerified, user.role)) {
      throw new ForbiddenError("Verified email required")
    }

    const tournament = await this.lobbyRepository.findTournamentForJoin(tournamentId)

    if (!tournament) {
      throw new NotFoundError("Tournament not found")
    }

    if (tournament.status !== "OPEN") {
      throw new BadRequestError("Tournament lobby is not open for joining")
    }

    const existing = await this.lobbyRepository.findPlayer(tournamentId, userId)

    if (!existing && tournament.playerCount >= tournament.maxPlayers) {
      throw new BadRequestError("Tournament lobby is full")
    }

    if (tournament.hostId === userId) {
      throw new ForbiddenError("Host cannot join as a player")
    }

    if (tournament.passwordProtected) {
      if (!password) {
        throw new UnauthorizedError("Tournament password required")
      }

      const hash = await this.lobbyRepository.findPasswordHash(tournamentId)

      if (!hash) {
        throw new BadRequestError("Tournament password is not configured")
      }

      const valid = await bcrypt.compare(password, hash)

      if (!valid) {
        throw new UnauthorizedError("Incorrect tournament password")
      }
    }

    let role: "MOD" | "PLAYER" = "PLAYER"

    if (await this.lobbyRepository.isModerator(tournamentId, userId)) {
      role = "MOD"
    }

    const state = await this.lobbyRepository.join({
      tournamentId,
      userId,
      role,
    })

    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.LOBBY_JOIN,
      actorId: userId,
      targetType: ACTIVITY_TARGET_TYPES.TOURNAMENT,
      targetId: tournamentId,
      tournamentId,
      summary: `Joined tournament lobby as ${role}`,
      metadata: { role },
    })

    return state
  }

  async reconnectLive(tournamentId: string, userId: string): Promise<LobbyState> {
    const tournament = await this.lobbyRepository.findTournamentForJoin(tournamentId)

    if (!tournament) {
      throw new NotFoundError("Tournament not found")
    }

    if (tournament.status !== "LIVE") {
      throw new BadRequestError("Tournament is not live")
    }

    const role = await this.lobbyRepository.findParticipantRole(tournamentId, userId)

    if (!role) {
      throw new ForbiddenError("Only enrolled players can reconnect during a live tournament")
    }

    return this.getLobbyState(tournamentId)
  }

  async leave(tournamentId: string, userId: string): Promise<LobbyState | null> {
    const tournament = await this.lobbyRepository.findTournamentForJoin(tournamentId)

    if (!tournament) {
      throw new NotFoundError("Tournament not found")
    }

    const state = await this.lobbyRepository.leave(tournamentId, userId)

    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.LOBBY_LEAVE,
      actorId: userId,
      targetType: ACTIVITY_TARGET_TYPES.TOURNAMENT,
      targetId: tournamentId,
      tournamentId,
      summary: `Left tournament lobby`,
    })

    return state
  }
}
