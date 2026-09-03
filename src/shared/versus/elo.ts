import type { ProblemDifficulty } from "../../domain/entities/problem.entity.js"

export const MATCH_LOBBY_SECONDS = 30

export const MATCH_DURATION_BY_DIFFICULTY: Record<ProblemDifficulty, number> = {
  EASY: 15,
  MEDIUM: 30,
  HARD: 45,
}

export const ELO_K_BY_DIFFICULTY: Record<ProblemDifficulty, number> = {
  EASY: 16,
  MEDIUM: 24,
  HARD: 32,
}

export const ELO_FLOOR = 100

export function expectedScore(rating: number, opponentRating: number): number {
  return 1 / (1 + 10 ** ((opponentRating - rating) / 400))
}

export function applyEloDelta(
  rating: number,
  opponentRating: number,
  score: 0 | 0.5 | 1,
  k: number,
): number {
  const expected = expectedScore(rating, opponentRating)
  const next = Math.round(rating + k * (score - expected))
  return Math.max(ELO_FLOOR, next)
}
