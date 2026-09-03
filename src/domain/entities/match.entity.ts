import type { ProblemDifficulty, ProblemWithTests } from "./problem.entity.js"
import type { User } from "./user.entity.js"

export type MatchStatus = "LOBBY" | "LIVE" | "ENDED" | "ABORTED"

export type SubmissionVerdict =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "RUNTIME_ERROR"
  | "TIMEOUT"
  | "COMPILE_ERROR"
  | "UNSUPPORTED"

export type MatchRecord = {
  id: string
  playerAId: string
  playerBId: string
  problemId: string
  difficulty: ProblemDifficulty
  status: MatchStatus
  durationMinutes: number
  lobbyEndsAt: Date
  startedAt: Date | null
  endedAt: Date | null
  winnerId: string | null
  playerAEloBefore: number
  playerBEloBefore: number
  playerAEloAfter: number | null
  playerBEloAfter: number | null
  endedReason: string | null
  createdAt: Date
  updatedAt: Date
}

export type MatchWithPlayers = MatchRecord & {
  playerA: User
  playerB: User
  problem: ProblemWithTests
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
  playerAId: string
  playerBId: string
  problemId: string
  difficulty: ProblemDifficulty
  durationMinutes: number
  lobbyEndsAt: Date
  playerAEloBefore: number
  playerBEloBefore: number
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
