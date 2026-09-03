export type ReportTargetType = "USER" | "TOURNAMENT" | "PROBLEM"
export type ReportCategory = "HARASSMENT" | "HATE" | "SEXUAL" | "SPAM" | "CHEATING" | "OTHER"
export type ReportStatus = "OPEN" | "RESOLVED" | "DISMISSED"

export type Report = {
  id: string
  reporterId: string
  targetType: ReportTargetType
  targetId: string
  contextTournamentId: string | null
  category: ReportCategory
  details: string
  status: ReportStatus
  resolutionNote: string | null
  resolvedById: string | null
  resolvedAt: Date | null
  createdAt: Date
}

export type ReportWithReporter = Report & {
  reporterDisplayName: string
  reporterEmail: string
}

export type CreateReportData = {
  reporterId: string
  targetType: ReportTargetType
  targetId: string
  contextTournamentId?: string | null
  category: ReportCategory
  details: string
}

export type ResolveReportData = {
  status: "RESOLVED" | "DISMISSED"
  resolutionNote?: string | null
  resolvedById: string
}

export type ModerationActionType = "WARN" | "SUSPEND" | "UNSUSPEND" | "PROMOTE" | "DEMOTE"

export type ModerationAction = {
  id: string
  actorId: string
  subjectUserId: string
  type: ModerationActionType
  note: string | null
  acknowledgedAt: Date | null
  createdAt: Date
}

export type ModerationActionWithActor = ModerationAction & {
  actorDisplayName: string
}

export type CreateModerationActionData = {
  actorId: string
  subjectUserId: string
  type: ModerationActionType
  note?: string | null
}
