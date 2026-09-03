import type {
  CreateMatchData,
  CreateMatchSubmissionData,
  MatchHistoryRecord,
  MatchRecord,
  MatchStatus,
  MatchSubmissionRecord,
  MatchWithPlayers,
} from "../entities/match.entity.js"

export type SettleMatchData = {
  winnerId: string | null
  playerAEloAfter: number
  playerBEloAfter: number
  endedAt: Date
  status?: "ENDED" | "ABORTED"
  endedReason?: string | null
}

export interface IMatchRepository {
  create(data: CreateMatchData): Promise<MatchWithPlayers>
  findById(id: string): Promise<MatchWithPlayers | null>
  findByStatus(status: MatchStatus): Promise<MatchWithPlayers[]>
  startLive(id: string, startedAt: Date): Promise<MatchWithPlayers | null>
  settle(id: string, fromStatuses: MatchStatus[], data: SettleMatchData): Promise<MatchWithPlayers | null>
  createSubmission(data: CreateMatchSubmissionData): Promise<MatchSubmissionRecord>
  hasAccepted(matchId: string): Promise<boolean>
  findLatestSubmissions(matchId: string): Promise<MatchSubmissionRecord[]>
  findRecentEndedByUserId(userId: string, limit: number): Promise<MatchHistoryRecord[]>
}
