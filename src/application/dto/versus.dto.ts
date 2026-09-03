import { z } from "zod"
import type { ProblemDetailDto } from "./problem.dto.js"
import type { SubmissionResultDto } from "./submission.dto.js"

export const versusDifficultySchema = z.enum(["easy", "medium", "hard"])

export type VersusDifficultyDto = z.infer<typeof versusDifficultySchema>

export type VersusPlayerCardDto = {
  id: string
  displayName: string
  avatarUrl: string | null
  elo1v1: number
  peakElo1v1: number
  winRate: number
  matchCount: number
  winStreak1v1: number
  wins: number
  losses: number
  draws: number
}

export type VersusMatchDto = {
  id: string
  status: "lobby" | "live" | "ended" | "aborted"
  difficulty: VersusDifficultyDto
  durationMinutes: number
  lobbyEndsAt: string
  startedAt: string | null
  endedAt: string | null
  winnerId: string | null
  youAre: "a" | "b"
  playerA: VersusPlayerCardDto
  playerB: VersusPlayerCardDto
  playerAEloBefore: number
  playerBEloBefore: number
  playerAEloAfter: number | null
  playerBEloAfter: number | null
  problem: ProblemDetailDto | null
}

export type VersusMatchEndedDto = {
  match: VersusMatchDto
  result: "win" | "loss" | "draw" | "abort"
  yourEloDelta: number
}

export type VersusSubmissionResultDto = SubmissionResultDto & {
  matchEnded?: VersusMatchEndedDto
}
