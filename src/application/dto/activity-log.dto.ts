import { z } from "zod"
import { ACTIVITY_ACTIONS } from "../../domain/entities/activity-log.entity.js"

const actionValues = Object.values(ACTIVITY_ACTIONS) as [string, ...string[]]

export const activityLogListQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  action: z.enum(actionValues).optional(),
  actorId: z.string().trim().min(1).optional(),
  targetType: z.enum(["USER", "TOURNAMENT", "PROBLEM", "REPORT", "SUBMISSION"]).optional(),
  targetId: z.string().trim().min(1).optional(),
  tournamentId: z.string().trim().min(1).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  cursor: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
})

export type ActivityLogListQueryDto = z.infer<typeof activityLogListQuerySchema>
