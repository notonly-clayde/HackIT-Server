import { z } from "zod"

export const createReportSchema = z.object({
  targetType: z.enum(["user", "tournament", "problem"]),
  targetId: z.string().min(1),
  contextTournamentId: z.string().min(1).optional().nullable(),
  category: z.enum(["harassment", "hate", "sexual", "spam", "cheating", "other"]),
  details: z.string().trim().min(1).max(2000),
})

export type CreateReportDto = z.infer<typeof createReportSchema>

export const resolveReportSchema = z.object({
  resolution: z.enum(["resolved", "dismissed"]),
  note: z.string().trim().max(1000).optional().nullable(),
  suspendUser: z.boolean().optional().default(false),
  suspendReason: z.string().trim().min(1).max(500).optional(),
})

export type ResolveReportDto = z.infer<typeof resolveReportSchema>

export const adminUserListQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["active", "suspended"]).optional(),
  role: z.enum(["user", "admin"]).optional(),
})

export type AdminUserListQueryDto = z.infer<typeof adminUserListQuerySchema>

export const warnUserSchema = z.object({
  note: z.string().trim().min(1).max(1000),
})

export const suspendUserSchema = z.object({
  reason: z.string().trim().min(1).max(500),
})

export const setUserRoleSchema = z.object({
  role: z.enum(["user", "admin"]),
})

export type ReportResponseDto = {
  id: string
  reporterId: string
  reporterDisplayName: string
  reporterEmail: string
  targetType: "user" | "tournament" | "problem"
  targetId: string
  contextTournamentId: string | null
  category: "harassment" | "hate" | "sexual" | "spam" | "cheating" | "other"
  details: string
  status: "open" | "resolved" | "dismissed"
  resolutionNote: string | null
  resolvedById: string | null
  resolvedAt: string | null
  createdAt: string
}

export type ModerationActionResponseDto = {
  id: string
  actorId: string
  actorDisplayName: string
  subjectUserId: string
  type: "warn" | "suspend" | "unsuspend" | "promote" | "demote"
  note: string | null
  acknowledgedAt: string | null
  createdAt: string
}
