import bcrypt from "bcryptjs"
import type {
  BattleType,
  StartMode,
  TournamentFilters,
  TournamentStatus,
  TournamentWithHost,
  Visibility,
} from "../../domain/entities/tournament.entity.js"
import type { UserRole } from "../../domain/entities/user.entity.js"
import type { ITournamentRepository } from "../../domain/repositories/tournament.repository.js"
import type { IUserRepository } from "../../domain/repositories/user.repository.js"
import type { CreateTournamentDto, UpdateTournamentDto } from "../dto/tournament.dto.js"
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_TARGET_TYPES,
} from "../../domain/entities/activity-log.entity.js"
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../../shared/errors/app-error.js"
import { isUserEmailVerified } from "../../shared/auth/email-verified.js"
import type { ActivityLogService } from "./activity-log.service.js"

const BCRYPT_ROUNDS = 10

export class TournamentService {
  constructor(
    private readonly tournamentRepository: ITournamentRepository,
    private readonly userRepository: IUserRepository,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async list(filters: TournamentFilters): Promise<TournamentWithHost[]> {
    return this.tournamentRepository.findMany(filters)
  }

  async getById(id: string): Promise<TournamentWithHost> {
    const tournament = await this.tournamentRepository.findByIdWithHost(id)

    if (!tournament) {
      throw new NotFoundError("Tournament not found")
    }

    return tournament
  }

  async create(hostId: string, _emailVerified: boolean, input: CreateTournamentDto): Promise<TournamentWithHost> {
    const host = await this.userRepository.findById(hostId)
    if (!host) {
      throw new BadRequestError("User profile not found. Call /api/auth/bootstrap first.")
    }

    this.requireVerified(host)

    const moderatorIds = await this.resolveModeratorIds(input.moderatorEmails, hostId)
    const scheduledAt = this.resolveScheduledAt(input.schedule, input.startsAt)
    const status: TournamentStatus = input.schedule === "now" ? "OPEN" : "SOON"
    const passwordHash = input.password ? await bcrypt.hash(input.password, BCRYPT_ROUNDS) : null

    const tournament = await this.tournamentRepository.create({
      name: input.name,
      type: this.toBattleType(input.type),
      scheduledAt,
      status,
      maxPlayers: input.maxPlayers,
      durationMinutes: input.durationMinutes,
      description: input.description,
      visibility: this.toVisibility(input.visibility),
      startMode: this.toStartMode(input.startMode),
      passwordProtected: Boolean(passwordHash),
      passwordHash,
      hostId,
      moderatorIds,
    })

    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.TOURNAMENT_CREATED,
      actorId: hostId,
      targetType: ACTIVITY_TARGET_TYPES.TOURNAMENT,
      targetId: tournament.id,
      tournamentId: tournament.id,
      summary: `Tournament created: ${tournament.name}`,
    })

    return tournament
  }

  async update(
    id: string,
    actorId: string,
    _emailVerified: boolean,
    input: UpdateTournamentDto,
  ): Promise<TournamentWithHost> {
    const actor = await this.userRepository.findById(actorId)
    if (!actor) {
      throw new BadRequestError("User profile not found. Call /api/auth/bootstrap first.")
    }
    this.requireVerified(actor)

    const tournament = await this.getById(id)
    this.requireHost(tournament.hostId, actorId)
    this.requireEditable(tournament.status)

    const data: Parameters<ITournamentRepository["update"]>[1] = {}

    if (input.name !== undefined) data.name = input.name
    if (input.description !== undefined) data.description = input.description
    if (input.type !== undefined) data.type = this.toBattleType(input.type)
    if (input.visibility !== undefined) data.visibility = this.toVisibility(input.visibility)
    if (input.startMode !== undefined) data.startMode = this.toStartMode(input.startMode)
    if (input.maxPlayers !== undefined) data.maxPlayers = input.maxPlayers
    if (input.durationMinutes !== undefined) data.durationMinutes = input.durationMinutes

    if (input.schedule !== undefined) {
      data.scheduledAt = this.resolveScheduledAt(input.schedule, input.startsAt)
      data.status = input.schedule === "now" ? "OPEN" : "SOON"
    } else if (input.startsAt !== undefined) {
      data.scheduledAt = new Date(input.startsAt)
    }

    if (input.password !== undefined) {
      if (input.password === null || input.password === "") {
        data.passwordHash = null
        data.passwordProtected = false
      } else {
        data.passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)
        data.passwordProtected = true
      }
    }

    if (input.moderatorEmails !== undefined) {
      data.moderatorIds = await this.resolveModeratorIds(input.moderatorEmails, actorId)
    }

    const updated = await this.tournamentRepository.update(id, data)

    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.TOURNAMENT_UPDATED,
      actorId,
      targetType: ACTIVITY_TARGET_TYPES.TOURNAMENT,
      targetId: updated.id,
      tournamentId: updated.id,
      summary: `Tournament updated: ${updated.name}`,
    })

    return updated
  }

  async delete(id: string, actorId: string, _emailVerified: boolean): Promise<void> {
    const actor = await this.userRepository.findById(actorId)
    if (!actor) {
      throw new BadRequestError("User profile not found. Call /api/auth/bootstrap first.")
    }
    this.requireVerified(actor)

    const tournament = await this.getById(id)
    this.requireHost(tournament.hostId, actorId)
    this.requireEditable(tournament.status)

    await this.tournamentRepository.delete(id)

    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.TOURNAMENT_DELETED,
      actorId,
      targetType: ACTIVITY_TARGET_TYPES.TOURNAMENT,
      targetId: id,
      tournamentId: id,
      summary: `Tournament deleted: ${tournament.name}`,
    })
  }

  async verifyPassword(id: string, password: string): Promise<{ ok: true }> {
    const tournament = await this.getById(id)

    if (!tournament.passwordProtected) {
      return { ok: true }
    }

    const hash = await this.tournamentRepository.findPasswordHash(id)

    if (!hash) {
      throw new BadRequestError("Tournament password is not configured")
    }

    const valid = await bcrypt.compare(password, hash)

    if (!valid) {
      throw new UnauthorizedError("Incorrect tournament password")
    }

    return { ok: true }
  }

  private requireVerified(user: { emailVerified: boolean; role: UserRole }) {
    if (!isUserEmailVerified(user)) {
      throw new ForbiddenError("Verified email required")
    }
  }

  private requireHost(hostId: string, actorId: string) {
    if (hostId !== actorId) {
      throw new ForbiddenError("Only the host can modify this tournament")
    }
  }

  private requireEditable(status: TournamentStatus) {
    if (status !== "OPEN" && status !== "SOON") {
      throw new ForbiddenError("Tournament can only be edited or deleted while Open or Soon")
    }
  }

  private resolveScheduledAt(schedule: "now" | "later", startsAt?: string): Date {
    if (schedule === "now") {
      return new Date()
    }

    if (!startsAt) {
      throw new BadRequestError("startsAt is required when schedule is later")
    }

    const date = new Date(startsAt)

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestError("Invalid startsAt")
    }

    return date
  }

  private async resolveModeratorIds(emails: string[], hostId: string): Promise<string[]> {
    if (emails.length === 0) return []

    const uniqueEmails = [...new Set(emails.map((email) => email.trim().toLowerCase()).filter(Boolean))]
    const users = await this.userRepository.findByEmails(uniqueEmails)

    const found = new Map(users.map((user) => [user.email.toLowerCase(), user]))
    const missing = uniqueEmails.filter((email) => !found.has(email))

    if (missing.length > 0) {
      throw new BadRequestError(
        `Moderator(s) not found or not registered on HackIT: ${missing.join(", ")}. They must sign up and verify email first.`,
      )
    }

    const unverified = users.filter((user) => !isUserEmailVerified(user))
    if (unverified.length > 0) {
      throw new BadRequestError(
        `Moderator(s) must have verified email: ${unverified.map((u) => u.email).join(", ")}`,
      )
    }

    return users.filter((user) => user.id !== hostId).map((user) => user.id)
  }

  private toBattleType(type: "ffa" | "1v1"): BattleType {
    return type === "1v1" ? "ONE_V_ONE" : "FREE_FOR_ALL"
  }

  private toVisibility(visibility: "public" | "private"): Visibility {
    return visibility === "private" ? "PRIVATE" : "PUBLIC"
  }

  private toStartMode(startMode: "manual" | "auto"): StartMode {
    return startMode === "auto" ? "AUTO" : "MANUAL"
  }
}
