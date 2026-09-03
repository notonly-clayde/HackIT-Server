import type { User } from "../../domain/entities/user.entity.js"
import type { ModerationActionWithActor, ReportWithReporter } from "../../domain/entities/moderation.entity.js"
import type { PublicUserResponseDto, UserResponseDto } from "../dto/user.dto.js"
import type { ModerationActionResponseDto, ReportResponseDto } from "../dto/moderation.dto.js"

const targetTypeLabels = {
  USER: "user",
  TOURNAMENT: "tournament",
  PROBLEM: "problem",
} as const

const categoryLabels = {
  HARASSMENT: "harassment",
  HATE: "hate",
  SEXUAL: "sexual",
  SPAM: "spam",
  CHEATING: "cheating",
  OTHER: "other",
} as const

const reportStatusLabels = {
  OPEN: "open",
  RESOLVED: "resolved",
  DISMISSED: "dismissed",
} as const

const actionTypeLabels = {
  WARN: "warn",
  SUSPEND: "suspend",
  UNSUSPEND: "unsuspend",
  PROMOTE: "promote",
  DEMOTE: "demote",
} as const

export function toUserResponseDto(
  user: User,
  options?: { activeWarn?: ModerationActionWithActor | null },
): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    emailVerified: user.emailVerified,
    role: user.role === "ADMIN" ? "admin" : "user",
    status: user.status === "SUSPENDED" ? "suspended" : "active",
    suspendedAt: user.suspendedAt?.toISOString() ?? null,
    suspendReason: user.suspendReason,
    elo1v1: user.elo1v1,
    eloTournament: user.eloTournament,
    peakElo1v1: Math.max(user.peakElo1v1, user.elo1v1),
    winStreak1v1: user.winStreak1v1,
    wins: user.wins,
    draws: user.draws,
    matchCount: user.matchCount,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    lastSyncedAt: user.lastSyncedAt.toISOString(),
    ...(options?.activeWarn
      ? {
          activeWarn: {
            id: options.activeWarn.id,
            note: options.activeWarn.note,
            createdAt: options.activeWarn.createdAt.toISOString(),
          },
        }
      : {}),
  }
}

export function toPublicUserResponseDto(user: User): PublicUserResponseDto {
  return {
    id: user.id,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    elo1v1: user.elo1v1,
    eloTournament: user.eloTournament,
    peakElo1v1: Math.max(user.peakElo1v1, user.elo1v1),
    winStreak1v1: user.winStreak1v1,
    wins: user.wins,
    draws: user.draws,
    matchCount: user.matchCount,
    createdAt: user.createdAt.toISOString(),
  }
}

export function toReportResponseDto(report: ReportWithReporter): ReportResponseDto {
  return {
    id: report.id,
    reporterId: report.reporterId,
    reporterDisplayName: report.reporterDisplayName,
    reporterEmail: report.reporterEmail,
    targetType: targetTypeLabels[report.targetType],
    targetId: report.targetId,
    contextTournamentId: report.contextTournamentId,
    category: categoryLabels[report.category],
    details: report.details,
    status: reportStatusLabels[report.status],
    resolutionNote: report.resolutionNote,
    resolvedById: report.resolvedById,
    resolvedAt: report.resolvedAt?.toISOString() ?? null,
    createdAt: report.createdAt.toISOString(),
  }
}

export function toModerationActionResponseDto(
  action: ModerationActionWithActor,
): ModerationActionResponseDto {
  return {
    id: action.id,
    actorId: action.actorId,
    actorDisplayName: action.actorDisplayName,
    subjectUserId: action.subjectUserId,
    type: actionTypeLabels[action.type],
    note: action.note,
    acknowledgedAt: action.acknowledgedAt?.toISOString() ?? null,
    createdAt: action.createdAt.toISOString(),
  }
}
