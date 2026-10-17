import type { TournamentEndReason, TournamentWithHost } from "../../domain/entities/tournament.entity.js"
import type { TournamentEndReasonDto } from "../../shared/realtime/tournament-live-state-notifier.js"
import type { TournamentItemDto } from "../dto/tournament.dto.js"
import type { TournamentLiveStateDto } from "../../shared/realtime/tournament-live-state-notifier.js"

const battleTypeLabels = {
  ONE_V_ONE: "1v1 Match",
  FREE_FOR_ALL: "Free For All",
} as const

const statusLabels = {
  OPEN: "Open",
  SOON: "Soon",
  LIVE: "Live",
  ENDED: "Ended",
} as const

const endReasonLabels: Record<TournamentEndReason, TournamentEndReasonDto> = {
  HOST: "host",
  TIMER: "timer",
  ALL_PLAYERS_FINISHED: "all_players_finished",
}

export function toTournamentEndReasonDto(
  reason: TournamentEndReason | null,
): TournamentEndReasonDto | null {
  if (!reason) return null
  return endReasonLabels[reason]
}

function formatScheduledDate(date: Date, status: TournamentWithHost["status"]): string {
  if (status === "LIVE") {
    return "Today · Ongoing"
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
    .format(date)
    .replace(",", " ·")
}

export type TournamentItemDtoExtras = {
  moderatorInvites?: TournamentItemDto["moderatorInvites"]
  viewerModeratorInvitePending?: boolean
}

export function toTournamentItemDto(
  tournament: TournamentWithHost,
  viewerRole?: "host" | "player" | "mod" | null,
  extras?: TournamentItemDtoExtras,
): TournamentItemDto {
  const item: TournamentItemDto = {
    id: tournament.id,
    name: tournament.name,
    type: battleTypeLabels[tournament.type],
    date: formatScheduledDate(tournament.scheduledAt, tournament.status),
    status: statusLabels[tournament.status],
    players: tournament.playerCount,
    maxPlayers: tournament.maxPlayers,
    duration: `${tournament.durationMinutes} min`,
    durationMinutes: tournament.durationMinutes,
    description: tournament.description,
    visibility: tournament.visibility === "PRIVATE" ? "private" : "public",
    startMode: tournament.startMode === "AUTO" ? "auto" : "manual",
    host: tournament.hostDisplayName,
    hostId: tournament.hostId,
    moderators: tournament.moderators,
    scheduledAt: tournament.scheduledAt.toISOString(),
    createdAt: tournament.createdAt.toISOString(),
    liveStartedAt: tournament.liveStartedAt?.toISOString() ?? null,
    pausedAt: tournament.pausedAt?.toISOString() ?? null,
    resumeAt: tournament.resumeAt?.toISOString() ?? null,
    pausedTotalMs: tournament.pausedTotalMs,
    endedAt: tournament.endedAt?.toISOString() ?? null,
    endReason: toTournamentEndReasonDto(tournament.endReason),
  }

  if (tournament.passwordProtected) {
    item.passwordProtected = true
  }

  if (viewerRole !== undefined) {
    item.viewerRole = viewerRole
  }

  if (extras?.moderatorInvites !== undefined) {
    item.moderatorInvites = extras.moderatorInvites
  }

  if (extras?.viewerModeratorInvitePending) {
    item.viewerModeratorInvitePending = true
  }

  return item
}

export function toTournamentLiveStateDto(tournament: TournamentWithHost): TournamentLiveStateDto {
  return {
    tournamentId: tournament.id,
    status: statusLabels[tournament.status],
    liveStartedAt: tournament.liveStartedAt?.toISOString() ?? null,
    pausedAt: tournament.pausedAt?.toISOString() ?? null,
    resumeAt: tournament.resumeAt?.toISOString() ?? null,
    pausedTotalMs: tournament.pausedTotalMs,
    endedAt: tournament.endedAt?.toISOString() ?? null,
    endReason: toTournamentEndReasonDto(tournament.endReason),
    durationMinutes: tournament.durationMinutes,
  }
}
