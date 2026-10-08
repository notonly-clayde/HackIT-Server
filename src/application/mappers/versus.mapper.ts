import type { MatchHistoryRecord, MatchWithPlayers } from "../../domain/entities/match.entity.js"
import type { User } from "../../domain/entities/user.entity.js"
import { toPlayerProblemDetailDto } from "./problem.mapper.js"
import type { MatchHistoryItemDto } from "../dto/user.dto.js"
import type { VersusEndedReason, VersusMatchDto, VersusPlayerCardDto } from "../dto/versus.dto.js"

const statusLabels = {
  LOBBY: "lobby",
  LIVE: "live",
  ENDED: "ended",
  ABORTED: "aborted",
} as const

const difficultyLabels = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
} as const

export function toVersusPlayerCardDto(user: User): VersusPlayerCardDto {
  const losses = Math.max(0, user.matchCount - user.wins - user.draws)
  const winRate = user.matchCount > 0 ? user.wins / user.matchCount : 0

  return {
    id: user.id,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    elo1v1: user.elo1v1,
    peakElo1v1: Math.max(user.peakElo1v1, user.elo1v1),
    winRate,
    matchCount: user.matchCount,
    winStreak1v1: user.winStreak1v1,
    wins: user.wins,
    losses,
    draws: user.draws,
  }
}

function parseEndedReason(raw: string | null, status: MatchWithPlayers["status"]): VersusEndedReason | null {
  if (status === "ABORTED") return "abort"
  if (raw === "first_ac" || raw === "timeout" || raw === "forfeit" || raw === "agreed_draw" || raw === "abort") {
    return raw
  }
  if (status === "ENDED") {
    return raw ? "timeout" : null
  }
  return null
}

export function toVersusMatchDto(
  match: MatchWithPlayers,
  viewerId: string,
  extras?: { solveElapsedMinutes?: number | null },
): VersusMatchDto {
  const includeProblem = match.status === "LIVE" || match.status === "ENDED"

  return {
    id: match.id,
    kind: match.kind === "PRIVATE" ? "private" : "ranked",
    lobbyName: match.lobbyName,
    passwordProtected: Boolean(match.passwordHash),
    status: statusLabels[match.status],
    difficulty: difficultyLabels[match.difficulty],
    durationMinutes: match.durationMinutes,
    lobbyEndsAt: match.lobbyEndsAt.toISOString(),
    startedAt: match.startedAt?.toISOString() ?? null,
    endedAt: match.endedAt?.toISOString() ?? null,
    winnerId: match.winnerId,
    endedReason: parseEndedReason(match.endedReason, match.status),
    youAre: match.playerAId === viewerId ? "a" : "b",
    playerA: toVersusPlayerCardDto(match.playerA),
    playerB: match.playerB ? toVersusPlayerCardDto(match.playerB) : null,
    playerAEloBefore: match.playerAEloBefore,
    playerBEloBefore: match.playerBEloBefore,
    playerAEloAfter: match.playerAEloAfter,
    playerBEloAfter: match.playerBEloAfter,
    problem: includeProblem ? toPlayerProblemDetailDto(match.problem) : null,
    solveElapsedMinutes: extras?.solveElapsedMinutes ?? null,
  }
}

export function toMatchHistoryItemDto(match: MatchHistoryRecord, profileUserId: string): MatchHistoryItemDto {
  const isA = match.playerAId === profileUserId
  const before = isA ? match.playerAEloBefore : match.playerBEloBefore
  const after = (isA ? match.playerAEloAfter : match.playerBEloAfter) ?? before
  const opponent = isA ? match.playerB : match.playerA
  const result: MatchHistoryItemDto["result"] =
    match.winnerId === profileUserId ? "win" : match.winnerId ? "loss" : "draw"

  return {
    matchId: match.id,
    endedAt: (match.endedAt ?? new Date(0)).toISOString(),
    difficulty: difficultyLabels[match.difficulty],
    endedReason: parseEndedReason(match.endedReason, "ENDED"),
    result,
    eloBefore: before,
    eloAfter: after,
    eloDelta: after - before,
    opponent: {
      id: opponent.id,
      displayName: opponent.displayName,
      avatarUrl: opponent.avatarUrl,
    },
  }
}
