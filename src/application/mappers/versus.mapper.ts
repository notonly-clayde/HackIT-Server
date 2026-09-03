import type { MatchWithPlayers } from "../../domain/entities/match.entity.js"
import type { User } from "../../domain/entities/user.entity.js"
import { toPlayerProblemDetailDto } from "./problem.mapper.js"
import type { VersusMatchDto, VersusPlayerCardDto } from "../dto/versus.dto.js"

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

export function toVersusMatchDto(match: MatchWithPlayers, viewerId: string): VersusMatchDto {
  const includeProblem = match.status === "LIVE" || match.status === "ENDED"

  return {
    id: match.id,
    status: statusLabels[match.status],
    difficulty: difficultyLabels[match.difficulty],
    durationMinutes: match.durationMinutes,
    lobbyEndsAt: match.lobbyEndsAt.toISOString(),
    startedAt: match.startedAt?.toISOString() ?? null,
    endedAt: match.endedAt?.toISOString() ?? null,
    winnerId: match.winnerId,
    youAre: match.playerAId === viewerId ? "a" : "b",
    playerA: toVersusPlayerCardDto(match.playerA),
    playerB: toVersusPlayerCardDto(match.playerB),
    playerAEloBefore: match.playerAEloBefore,
    playerBEloBefore: match.playerBEloBefore,
    playerAEloAfter: match.playerAEloAfter,
    playerBEloAfter: match.playerBEloAfter,
    problem: includeProblem ? toPlayerProblemDetailDto(match.problem) : null,
  }
}
