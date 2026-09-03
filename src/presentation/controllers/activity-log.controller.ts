import type { Request, Response } from "express"
import type { ActivityLogService } from "../../application/services/activity-log.service.js"
import { activityLogListQuerySchema } from "../../application/dto/activity-log.dto.js"
import { ACTIVITY_ACTIONS } from "../../domain/entities/activity-log.entity.js"
import { BadRequestError } from "../../shared/errors/app-error.js"
import type { ActivityLogRecord } from "../../domain/entities/activity-log.entity.js"

function toDto(row: ActivityLogRecord) {
  return {
    id: row.id,
    action: row.action,
    actorType: row.actorType === "SYSTEM" ? "system" : "user",
    actorId: row.actorId,
    actorDisplayName: row.actorDisplayName,
    actorEmail: row.actorEmail,
    targetType: row.targetType.toLowerCase(),
    targetId: row.targetId,
    tournamentId: row.tournamentId,
    summary: row.summary,
    metadata: row.metadata,
    createdAt: row.createdAt.toISOString(),
  }
}

export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  list = async (req: Request, res: Response) => {
    const parsed = activityLogListQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid query")
    }

    const { from, to, ...rest } = parsed.data
    const result = await this.activityLogService.list({
      ...rest,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    })

    res.json({
      items: result.items.map(toDto),
      nextCursor: result.nextCursor,
      actions: Object.values(ACTIVITY_ACTIONS),
    })
  }
}
