import type { ProblemDifficulty, ProblemWithTests } from "./problem.entity.js"
import type { User } from "./user.entity.js"

export type MatchStatus = "LOBBY" | "LIVE" | "ENDED" | "ABORTED"

export type MatchKind = "RANKED" | "PRIVATE"

export type SubmissionVerdict =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "RUNTIME_ERROR"
  | "TIMEOUT"
  | "COMPILE_ERROR"
  | "UNSUPPORTED"

export type MatchRecord = {
  id: string
  kind: MatchKind
  lobbyName: string | null
  passwordHash: string | null
  playerAId: string
  /** Null while a private room is waiting for its guest. */
  playerBId: string | null
  problemId: string
  difficulty: ProblemDifficulty
  status: MatchStatus
  durationMinutes: number
  lobbyEndsAt: Date
  startedAt: Date | null
  endedAt: Date | null
  winnerId: string | null
  playerAEloBefore: number
  playerBEloBefore: number | null
  playerAEloAfter: number | null
  playerBEloAfter: number | null
  endedReason: string | null
  createdAt: Date
  updatedAt: Date
}

export type MatchWithPlayers = MatchRecord & {
  playerA: User
  playerB: User | null
  problem: ProblemWithTests
}

/** A match with both seats filled — every ranked match, and private rooms after the guest joins. */
export type ReadyMatch = MatchWithPlayers & {
  playerBId: string
  playerB: User
  playerBEloBefore: number
}

export function isMatchReady(match: MatchWithPlayers): match is ReadyMatch {
  return match.playerBId !== null && match.playerB !== null && match.playerBEloBefore !== null
}

export type MatchHistoryOpponent = {
  id: string
  displayName: string
  avatarUrl: string | null
}

export type MatchHistoryRecord = {
  id: string
  difficulty: ProblemDifficulty
  endedAt: Date | null
  winnerId: string | null
  playerAId: string
  playerBId: string
  playerAEloBefore: number
  playerBEloBefore: number
  playerAEloAfter: number | null
  playerBEloAfter: number | null
  endedReason: string | null
  playerA: MatchHistoryOpponent
  playerB: MatchHistoryOpponent
}

export type CreateMatchData = {
  kind?: MatchKind
  lobbyName?: string | null
  passwordHash?: string | null
  playerAId: string
  playerBId: string | null
  problemId: string
  difficulty: ProblemDifficulty
  durationMinutes: number
  lobbyEndsAt: Date
  playerAEloBefore: number
  playerBEloBefore: number | null
}

export type AttachPlayerBData = {
  playerBId: string
  playerAEloBefore: number
  playerBEloBefore: number
  lobbyEndsAt: Date
}

export type MatchSubmissionRecord = {
  id: string
  matchId: string
  userId: string
  problemId: string
  language: string
  sourceCode: string
  verdict: SubmissionVerdict
  effectiveElapsedMinutes: number
  submittedAt: Date
}

export type CreateMatchSubmissionData = {
  matchId: string
  userId: string
  problemId: string
  language: string
  sourceCode: string
  verdict: SubmissionVerdict
  effectiveElapsedMinutes: number
}
