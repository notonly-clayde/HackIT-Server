export const ACTIVITY_ACTIONS = {
  USER_CREATED: "USER_CREATED",
  USER_PROFILE_UPDATED: "USER_PROFILE_UPDATED",
  USER_WARN_ACKNOWLEDGED: "USER_WARN_ACKNOWLEDGED",
  USER_WARNED: "USER_WARNED",
  USER_SUSPENDED: "USER_SUSPENDED",
  USER_UNSUSPENDED: "USER_UNSUSPENDED",
  USER_ROLE_CHANGED: "USER_ROLE_CHANGED",
  REPORT_CREATED: "REPORT_CREATED",
  REPORT_RESOLVED: "REPORT_RESOLVED",
  REPORT_DISMISSED: "REPORT_DISMISSED",
  PROBLEM_CREATED: "PROBLEM_CREATED",
  PROBLEM_UPDATED: "PROBLEM_UPDATED",
  PROBLEM_SUBMITTED_FOR_REVIEW: "PROBLEM_SUBMITTED_FOR_REVIEW",
  PROBLEM_APPROVED: "PROBLEM_APPROVED",
  PROBLEM_REJECTED: "PROBLEM_REJECTED",
  PROBLEM_UNPUBLISHED: "PROBLEM_UNPUBLISHED",
  TOURNAMENT_CREATED: "TOURNAMENT_CREATED",
  TOURNAMENT_UPDATED: "TOURNAMENT_UPDATED",
  TOURNAMENT_DELETED: "TOURNAMENT_DELETED",
  TOURNAMENT_PROBLEM_ATTACHED: "TOURNAMENT_PROBLEM_ATTACHED",
  TOURNAMENT_PROBLEM_DETACHED: "TOURNAMENT_PROBLEM_DETACHED",
  TOURNAMENT_PROBLEM_UPDATED: "TOURNAMENT_PROBLEM_UPDATED",
  TOURNAMENT_PROBLEM_REORDERED: "TOURNAMENT_PROBLEM_REORDERED",
  TOURNAMENT_STARTED: "TOURNAMENT_STARTED",
  TOURNAMENT_PAUSED: "TOURNAMENT_PAUSED",
  TOURNAMENT_RESUMED: "TOURNAMENT_RESUMED",
  TOURNAMENT_ENDED: "TOURNAMENT_ENDED",
  LOBBY_JOIN: "LOBBY_JOIN",
  LOBBY_LEAVE: "LOBBY_LEAVE",
  SUBMISSION_TOURNAMENT: "SUBMISSION_TOURNAMENT",
} as const

export type ActivityAction = (typeof ACTIVITY_ACTIONS)[keyof typeof ACTIVITY_ACTIONS]

export const ACTIVITY_TARGET_TYPES = {
  USER: "USER",
  TOURNAMENT: "TOURNAMENT",
  PROBLEM: "PROBLEM",
  REPORT: "REPORT",
  SUBMISSION: "SUBMISSION",
} as const

export type ActivityTargetType = (typeof ACTIVITY_TARGET_TYPES)[keyof typeof ACTIVITY_TARGET_TYPES]

export type ActivityActorType = "USER" | "SYSTEM"

export type ActivityLogRecord = {
  id: string
  action: string
  actorType: ActivityActorType
  actorId: string | null
  actorDisplayName: string | null
  actorEmail: string | null
  targetType: string
  targetId: string
  tournamentId: string | null
  summary: string
  metadata: unknown
  createdAt: Date
}

export type CreateActivityLogInput = {
  action: ActivityAction | string
  actorType?: ActivityActorType
  actorId?: string | null
  targetType: ActivityTargetType | string
  targetId: string
  tournamentId?: string | null
  summary: string
  metadata?: Record<string, unknown> | null
}

export type ActivityLogListFilters = {
  q?: string
  action?: string
  actorId?: string
  targetType?: string
  targetId?: string
  tournamentId?: string
  from?: Date
  to?: Date
  cursor?: string
  limit?: number
}

export type ActivityLogListResult = {
  items: ActivityLogRecord[]
  nextCursor: string | null
}
