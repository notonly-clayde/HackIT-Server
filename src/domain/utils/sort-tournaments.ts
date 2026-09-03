import type { TournamentStatus, TournamentWithHost } from "../entities/tournament.entity.js"

const STATUS_RANK: Record<TournamentStatus, number> = {
  LIVE: 0,
  OPEN: 1,
  SOON: 2,
  ENDED: 3,
}

function compareDate(a: Date | null, b: Date | null, direction: "asc" | "desc"): number {
  const aTime = a?.getTime() ?? 0
  const bTime = b?.getTime() ?? 0
  return direction === "asc" ? aTime - bTime : bTime - aTime
}

function compareTournaments(a: TournamentWithHost, b: TournamentWithHost): number {
  const statusDiff = STATUS_RANK[a.status] - STATUS_RANK[b.status]
  if (statusDiff !== 0) return statusDiff

  let timeDiff = 0
  if (a.status === "LIVE") {
    timeDiff = compareDate(a.liveStartedAt, b.liveStartedAt, "desc")
  } else if (a.status === "ENDED") {
    timeDiff = compareDate(a.endedAt, b.endedAt, "desc")
  } else {
    timeDiff = compareDate(a.scheduledAt, b.scheduledAt, "asc")
  }

  if (timeDiff !== 0) return timeDiff
  return a.name.localeCompare(b.name)
}

export function sortTournaments(tournaments: TournamentWithHost[]): TournamentWithHost[] {
  return [...tournaments].sort(compareTournaments)
}
