import { z } from "zod"
import type { VersusDifficultyDto, VersusEndedReason } from "./versus.dto.js"

export const updateUserSchema = z
  .object({
    displayName: z.string().trim().min(1).max(64).optional(),
    avatarUrl: z.string().url().nullable().optional(),
    bio: z.string().trim().max(500).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  })

export type UpdateUserDto = z.infer<typeof updateUserSchema>

export type UserResponseDto = {
  id: string
  email: string
  name: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
  emailVerified: boolean
  role: "user" | "admin"
  status: "active" | "suspended"
  suspendedAt: string | null
  suspendReason: string | null
    elo1v1: number
  eloTournament: number
  peakElo1v1: number
  winStreak1v1: number
  wins: number
  draws: number
  matchCount: number
  createdAt: string
  updatedAt: string
  lastSyncedAt: string
  activeWarn?: {
    id: string
    note: string | null
    createdAt: string
  } | null
}

export type PublicUserResponseDto = {
  id: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
  elo1v1: number
  eloTournament: number
  peakElo1v1: number
  winStreak1v1: number
  wins: number
  draws: number
  matchCount: number
  createdAt: string
}

export type MatchHistoryOpponentDto = {
  id: string
  displayName: string
  avatarUrl: string | null
}

export type MatchHistoryItemDto = {
  matchId: string
  endedAt: string
  difficulty: VersusDifficultyDto
  endedReason: VersusEndedReason | null
  result: "win" | "loss" | "draw"
  eloBefore: number
  eloAfter: number
  eloDelta: number
  opponent: MatchHistoryOpponentDto
}

export type ProfileHistoryKind = "all" | "versus" | "tournament"

export type ProfileHistoryVersusItemDto = MatchHistoryItemDto & { kind: "versus" }

export type ProfileHistoryTournamentItemDto = {
  kind: "tournament"
  tournamentId: string
  name: string
  tournamentType: "ffa" | "1v1"
  endedAt: string
  rank: number
  rankTotal: number
  solved: number
  score: number
}

export type ProfileHistoryItemDto = ProfileHistoryVersusItemDto | ProfileHistoryTournamentItemDto
