import type { Prisma } from "@prisma/client"
import type {
  ActivityLogListFilters,
  ActivityLogListResult,
  ActivityLogRecord,
  CreateActivityLogInput,
} from "../../domain/entities/activity-log.entity.js"
import type { IActivityLogRepository } from "../../domain/repositories/activity-log.repository.js"
import { prisma } from "./prisma.client.js"

function toRecord(row: {
  id: string
  action: string
  actorType: "USER" | "SYSTEM"
  actorId: string | null
  targetType: string
  targetId: string
  tournamentId: string | null
  summary: string
  metadata: Prisma.JsonValue
  createdAt: Date
  actor: { displayName: string; email: string } | null
}): ActivityLogRecord {
  return {
    id: row.id,
    action: row.action,
    actorType: row.actorType,
    actorId: row.actorId,
    actorDisplayName: row.actor?.displayName ?? null,
    actorEmail: row.actor?.email ?? null,
    targetType: row.targetType,
    targetId: row.targetId,
    tournamentId: row.tournamentId,
    summary: row.summary,
    metadata: row.metadata,
    createdAt: row.createdAt,
  }
}

export class PrismaActivityLogRepository implements IActivityLogRepository {
  async create(input: CreateActivityLogInput): Promise<ActivityLogRecord> {
    const row = await prisma.activityLog.create({
      data: {
        action: input.action,
        actorType: input.actorType ?? "USER",
        actorId: input.actorId ?? null,
        targetType: input.targetType,
        targetId: input.targetId,
        tournamentId: input.tournamentId ?? null,
        summary: input.summary,
        metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
      include: {
        actor: { select: { displayName: true, email: true } },
      },
    })
    return toRecord(row)
  }

  async list(filters: ActivityLogListFilters): Promise<ActivityLogListResult> {
    const limit = Math.min(Math.max(filters.limit ?? 50, 1), 100)
    const where: Prisma.ActivityLogWhereInput = {}

    if (filters.action) where.action = filters.action
    if (filters.actorId) where.actorId = filters.actorId
    if (filters.targetType) where.targetType = filters.targetType
    if (filters.targetId) where.targetId = filters.targetId
    if (filters.tournamentId) where.tournamentId = filters.tournamentId

    if (filters.from || filters.to) {
      where.createdAt = {}
      if (filters.from) where.createdAt.gte = filters.from
      if (filters.to) where.createdAt.lte = filters.to
    }

    if (filters.q?.trim()) {
      const q = filters.q.trim()
      where.OR = [
        { summary: { contains: q, mode: "insensitive" } },
        { targetId: { contains: q, mode: "insensitive" } },
        { action: { contains: q, mode: "insensitive" } },
        { actor: { displayName: { contains: q, mode: "insensitive" } } },
        { actor: { email: { contains: q, mode: "insensitive" } } },
      ]
    }

    if (filters.cursor) {
      where.id = { lt: filters.cursor }
      // Cursor is id; list is ordered by createdAt desc, id desc.
      // Prefer compound cursor via createdAt from the cursor row when present.
    }

    let cursorCreatedAt: Date | undefined
    if (filters.cursor) {
      const cursorRow = await prisma.activityLog.findUnique({
        where: { id: filters.cursor },
        select: { createdAt: true, id: true },
      })
      if (cursorRow) {
        cursorCreatedAt = cursorRow.createdAt
        where.AND = [
          {
            OR: [
              { createdAt: { lt: cursorRow.createdAt } },
              { createdAt: cursorRow.createdAt, id: { lt: cursorRow.id } },
            ],
          },
        ]
        delete where.id
      }
    }

    void cursorCreatedAt

    const rows = await prisma.activityLog.findMany({
      where,
      include: {
        actor: { select: { displayName: true, email: true } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
    })

    const hasMore = rows.length > limit
    const page = hasMore ? rows.slice(0, limit) : rows

    return {
      items: page.map(toRecord),
      nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null,
    }
  }
}
