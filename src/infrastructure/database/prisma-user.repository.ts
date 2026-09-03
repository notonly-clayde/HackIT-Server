import type { Prisma } from "@prisma/client"
import type {
  AuthClaims,
  UpdateMatchStatsInput,
  UpdateUserProfileInput,
  User,
  UserRole,
  UserStatus,
} from "../../domain/entities/user.entity.js"
import type {
  CreateModerationActionData,
  ModerationActionWithActor,
} from "../../domain/entities/moderation.entity.js"
import type { AdminUserFilters, IUserRepository } from "../../domain/repositories/user.repository.js"
import { prisma } from "./prisma.client.js"

function toUser(record: {
  id: string
  email: string
  name: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
  emailVerified: boolean
  role: "USER" | "ADMIN"
  status: "ACTIVE" | "SUSPENDED"
  suspendedAt: Date | null
  suspendReason: string | null
  elo1v1: number
  eloTournament: number
  peakElo1v1: number
  winStreak1v1: number
  wins: number
  draws: number
  matchCount: number
  createdAt: Date
  updatedAt: Date
  lastSyncedAt: Date
}): User {
  return { ...record }
}

function toModerationAction(record: {
  id: string
  actorId: string
  subjectUserId: string
  type: ModerationActionWithActor["type"]
  note: string | null
  acknowledgedAt: Date | null
  createdAt: Date
  actor: { displayName: string }
}): ModerationActionWithActor {
  return {
    id: record.id,
    actorId: record.actorId,
    subjectUserId: record.subjectUserId,
    type: record.type,
    note: record.note,
    acknowledgedAt: record.acknowledgedAt,
    createdAt: record.createdAt,
    actorDisplayName: record.actor.displayName,
  }
}

export class PrismaUserRepository implements IUserRepository {
  async upsertFromAuth(claims: AuthClaims, role: UserRole): Promise<User> {
    const record = await prisma.user.upsert({
      where: { id: claims.userId },
      create: {
        id: claims.userId,
        email: claims.email,
        name: claims.name,
        displayName: claims.name,
        avatarUrl: claims.avatarUrl,
        emailVerified: role === "ADMIN" ? true : claims.emailVerified,
        role,
      },
      update: {
        email: claims.email,
        name: claims.name,
        ...(claims.emailVerified ? { emailVerified: true } : {}),
        avatarUrl: claims.avatarUrl,
        // Preserve DB role so UI promote/demote survives bootstrap.
        lastSyncedAt: new Date(),
      },
    })

    return toUser(record)
  }

  async findById(id: string): Promise<User | null> {
    const record = await prisma.user.findUnique({ where: { id } })
    return record ? toUser(record) : null
  }

  async findByEmails(emails: string[]): Promise<User[]> {
    if (emails.length === 0) return []

    const unique = [...new Set(emails.map((email) => email.trim().toLowerCase()).filter(Boolean))]

    const records = await prisma.user.findMany({
      where: {
        OR: unique.map((email) => ({
          email: { equals: email, mode: "insensitive" },
        })),
      },
    })

    return records.map(toUser)
  }

  async findManyAdmin(filters: AdminUserFilters): Promise<User[]> {
    const where: Prisma.UserWhereInput = {}

    if (filters.status) where.status = filters.status
    if (filters.role) where.role = filters.role
    if (filters.search?.trim()) {
      const q = filters.search.trim()
      where.OR = [
        { email: { contains: q, mode: "insensitive" } },
        { displayName: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
      ]
    }

    const records = await prisma.user.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      take: 100,
    })

    return records.map(toUser)
  }

  async countAdmins(): Promise<number> {
    return prisma.user.count({ where: { role: "ADMIN" } })
  }

  async updateProfile(id: string, input: UpdateUserProfileInput): Promise<User> {
    const data: Prisma.UserUpdateInput = {}

    if (input.displayName !== undefined) data.displayName = input.displayName
    if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl
    if (input.bio !== undefined) data.bio = input.bio

    const record = await prisma.user.update({
      where: { id },
      data,
    })

    return toUser(record)
  }

  async updateMatchStats(id: string, input: UpdateMatchStatsInput): Promise<User> {
    const record = await prisma.user.update({
      where: { id },
      data: {
        elo1v1: input.elo1v1,
        peakElo1v1: input.peakElo1v1,
        winStreak1v1: input.winStreak1v1,
        wins: input.wins,
        draws: input.draws,
        matchCount: input.matchCount,
      },
    })

    return toUser(record)
  }

  async setSuspended(id: string, reason: string): Promise<User> {
    const record = await prisma.user.update({
      where: { id },
      data: {
        status: "SUSPENDED",
        suspendedAt: new Date(),
        suspendReason: reason,
      },
    })
    return toUser(record)
  }

  async clearSuspended(id: string): Promise<User> {
    const record = await prisma.user.update({
      where: { id },
      data: {
        status: "ACTIVE",
        suspendedAt: null,
        suspendReason: null,
      },
    })
    return toUser(record)
  }

  async setRole(id: string, role: UserRole): Promise<User> {
    const record = await prisma.user.update({
      where: { id },
      data: { role },
    })
    return toUser(record)
  }

  async createModerationAction(data: CreateModerationActionData): Promise<ModerationActionWithActor> {
    const record = await prisma.moderationAction.create({
      data: {
        actorId: data.actorId,
        subjectUserId: data.subjectUserId,
        type: data.type,
        note: data.note ?? null,
      },
      include: { actor: { select: { displayName: true } } },
    })
    return toModerationAction(record)
  }

  async listModerationActions(subjectUserId: string, limit = 50): Promise<ModerationActionWithActor[]> {
    const records = await prisma.moderationAction.findMany({
      where: { subjectUserId },
      include: { actor: { select: { displayName: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
    return records.map(toModerationAction)
  }

  async findLatestWarn(subjectUserId: string): Promise<ModerationActionWithActor | null> {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const record = await prisma.moderationAction.findFirst({
      where: {
        subjectUserId,
        type: "WARN",
        acknowledgedAt: null,
        createdAt: { gte: since },
      },
      include: { actor: { select: { displayName: true } } },
      orderBy: { createdAt: "desc" },
    })
    return record ? toModerationAction(record) : null
  }

  async acknowledgeWarn(actionId: string, subjectUserId: string): Promise<ModerationActionWithActor | null> {
    const existing = await prisma.moderationAction.findFirst({
      where: { id: actionId, subjectUserId, type: "WARN" },
    })
    if (!existing) return null

    const record = await prisma.moderationAction.update({
      where: { id: actionId },
      data: { acknowledgedAt: new Date() },
      include: { actor: { select: { displayName: true } } },
    })
    return toModerationAction(record)
  }
}
