import type { HostedLobbyItemDto } from "../dto/user.dto.js"

const STATUS_RANK = {
  Live: 0,
  Open: 1,
  Soon: 2,
  Ended: 3,
} as const

function sortTimestamp(item: HostedLobbyItemDto): number {
  if (item.lobbyKind === "privateRoom") {
    return new Date(item.createdAt).getTime()
  }
  if (item.status === "Live" && item.liveStartedAt) {
    return new Date(item.liveStartedAt).getTime()
  }
  if (item.status === "Ended" && item.endedAt) {
    return new Date(item.endedAt).getTime()
  }
  return new Date(item.createdAt).getTime()
}

function compareHosted(a: HostedLobbyItemDto, b: HostedLobbyItemDto): number {
  const aRank = STATUS_RANK[a.status as keyof typeof STATUS_RANK] ?? 2
  const bRank = STATUS_RANK[b.status as keyof typeof STATUS_RANK] ?? 2
  const statusDiff = aRank - bRank
  if (statusDiff !== 0) return statusDiff

  const timeDiff = sortTimestamp(b) - sortTimestamp(a)
  if (timeDiff !== 0) return timeDiff

  return a.name.localeCompare(b.name)
}

export function sortHostedLobbies(items: HostedLobbyItemDto[]): HostedLobbyItemDto[] {
  return [...items].sort(compareHosted)
}
