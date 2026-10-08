import type { Prisma } from "@prisma/client"
import type {
  CreateTournamentData,
  TournamentFilters,
  TournamentModerator,
  TournamentParticipation,
  TournamentStatus,
  TournamentWithHost,
  UpdateTournamentData,
} from "../../domain/entities/tournament.entity.js"
import type { ITournamentRepository } from "../../domain/repositories/tournament.repository.js"
import { sortTournaments } from "../../domain/utils/sort-tournaments.js"
import { prisma } from "./prisma.client.js"

const statusMap: Record<string, TournamentStatus> = {
  Open: "OPEN",
  Soon: "SOON",
  Live: "LIVE",
  Ended: "ENDED",
}

const hostInclude = {
  host: { select: { displayName: true } },
  moderators: {
    include: {
      user: { select: { id: true, displayName: true, email: true } },
    },
  },
} as const

type TournamentRecord = {
  id: string
  name: string
  type: "ONE_V_ONE" | "FREE_FOR_ALL"
  scheduledAt: Date
  status: "OPEN" | "SOON" | "LIVE" | "ENDED"
  playerCount: number
  maxPlayers: number
  durationMinutes: number
  description: string
  visibility: "PUBLIC" | "PRIVATE"
  startMode: "MANUAL" | "AUTO"
  passwordProtected: boolean
  passwordHash: string | null
  hostId: string
  liveStartedAt: Date | null
  pausedAt: Date | null
  resumeAt?: Date | null
  pausedTotalMs: number
  endedAt: Date | null
  createdAt: Date
  updatedAt: Date
  host: { displayName: string }
  moderators: {
    user: { id: string; displayName: string; email: string }
  }[]
}

function toModerators(record: TournamentRecord): TournamentModerator[] {
  return record.moderators.map((mod) => ({
    id: mod.user.id,
    displayName: mod.user.displayName,
    email: mod.user.email,
  }))
}

function toTournamentWithHost(record: TournamentRecord, includeHash = false): TournamentWithHost {
  return {
    id: record.id,
    name: record.name,
    type: record.type,
    scheduledAt: record.scheduledAt,
    status: record.status,
    playerCount: record.playerCount,
    maxPlayers: record.maxPlayers,
    durationMinutes: record.durationMinutes,
    description: record.description,
    visibility: record.visibility,
    startMode: record.startMode,
    passwordProtected: record.passwordProtected,
    hostId: record.hostId,
    liveStartedAt: record.liveStartedAt,
    pausedAt: record.pausedAt,
    resumeAt: record.resumeAt ?? null,
    pausedTotalMs: record.pausedTotalMs,
    endedAt: record.endedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    hostDisplayName: record.host.displayName,
    moderators: toModerators(record),
    ...(includeHash ? { passwordHash: record.passwordHash } : {}),
  }
}

export class PrismaTournamentRepository implements ITournamentRepository {
  async findMany(filters: TournamentFilters): Promise<TournamentWithHost[]> {
    const where: Prisma.TournamentWhereInput = {}

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ]
    }

    if (filters.type === "ffa") {
      where.type = "FREE_FOR_ALL"
    } else if (filters.type === "1v1") {
      where.type = "ONE_V_ONE"
    }

    if (filters.status && statusMap[filters.status]) {
      where.status = statusMap[filters.status]
    }

    const records = await prisma.tournament.findMany({
      where,
      include: hostInclude,
    })

    return sortTournaments(records.map((record) => toTournamentWithHost(record)))
  }

  async findByIdWithHost(id: string): Promise<TournamentWithHost | null> {
    const record = await prisma.tournament.findUnique({
      where: { id },
      include: hostInclude,
    })

    return record ? toTournamentWithHost(record) : null
  }

  async create(data: CreateTournamentData): Promise<TournamentWithHost> {
    const record = await prisma.tournament.create({
      data: {
        name: data.name,
        type: data.type,
        scheduledAt: data.scheduledAt,
        status: data.status,
        maxPlayers: data.maxPlayers,
        durationMinutes: data.durationMinutes,
        description: data.description,
        visibility: data.visibility,
        startMode: data.startMode,
        passwordProtected: data.passwordProtected,
        passwordHash: data.passwordHash,
        hostId: data.hostId,
        moderators: {
          create: data.moderatorIds.map((userId) => ({ userId })),
        },
      },
      include: hostInclude,
    })

    return toTournamentWithHost(record)
  }

  async update(id: string, data: UpdateTournamentData): Promise<TournamentWithHost> {
    await prisma.$transaction(async (tx) => {
      if (data.moderatorIds) {
        await tx.tournamentModerator.deleteMany({ where: { tournamentId: id } })
        if (data.moderatorIds.length > 0) {
          await tx.tournamentModerator.createMany({
            data: data.moderatorIds.map((userId) => ({ tournamentId: id, userId })),
          })
        }
      }

      await tx.tournament.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.type !== undefined ? { type: data.type } : {}),
          ...(data.scheduledAt !== undefined ? { scheduledAt: data.scheduledAt } : {}),
          ...(data.status !== undefined ? { status: data.status } : {}),
          ...(data.maxPlayers !== undefined ? { maxPlayers: data.maxPlayers } : {}),
          ...(data.durationMinutes !== undefined ? { durationMinutes: data.durationMinutes } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.visibility !== undefined ? { visibility: data.visibility } : {}),
          ...(data.startMode !== undefined ? { startMode: data.startMode } : {}),
          ...(data.passwordProtected !== undefined ? { passwordProtected: data.passwordProtected } : {}),
          ...(data.passwordHash !== undefined ? { passwordHash: data.passwordHash } : {}),
          ...(data.liveStartedAt !== undefined ? { liveStartedAt: data.liveStartedAt } : {}),
          ...(data.pausedAt !== undefined ? { pausedAt: data.pausedAt } : {}),
          ...(data.resumeAt !== undefined ? { resumeAt: data.resumeAt } : {}),
          ...(data.pausedTotalMs !== undefined ? { pausedTotalMs: data.pausedTotalMs } : {}),
          ...(data.endedAt !== undefined ? { endedAt: data.endedAt } : {}),
        },
      })
    })

    const record = await prisma.tournament.findUniqueOrThrow({
      where: { id },
      include: hostInclude,
    })

    return toTournamentWithHost(record)
  }

  async delete(id: string): Promise<void> {
    await prisma.tournament.delete({ where: { id } })
  }

  async findPasswordHash(id: string): Promise<string | null> {
    const record = await prisma.tournament.findUnique({
      where: { id },
      select: { passwordHash: true },
    })

    return record?.passwordHash ?? null
  }

  async findRecentEndedParticipationsByUserId(
    userId: string,
    limit: number,
    options: { publicOnly: boolean },
  ): Promise<TournamentParticipation[]> {
    const records = await prisma.tournament.findMany({
      where: {
        status: "ENDED",
        endedAt: { not: null },
        liveStartedAt: { not: null },
        ...(options.publicOnly ? { visibility: "PUBLIC" as const } : {}),
        players: { some: { userId, role: { not: "HOST" } } },
      },
      orderBy: { endedAt: "desc" },
      take: limit,
      select: { id: true, name: true, type: true, visibility: true, endedAt: true },
    })

    return records.flatMap(({ endedAt, ...rest }) => (endedAt ? [{ ...rest, endedAt }] : []))
  }
}
