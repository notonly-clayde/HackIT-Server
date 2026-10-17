import type {
  AttachPlayerBData,
  CreateMatchData,
  CreateMatchSubmissionData,
  HostedPrivateMatchRecord,
  MatchHistoryRecord,
  MatchRecord,
  ProfileMatchHistoryRecord,
  MatchStatus,
  MatchSubmissionRecord,
  MatchWithPlayers,
} from "../entities/match.entity.js"

export type SettleMatchData = {
  winnerId: string | null
  playerAEloAfter: number
  playerBEloAfter: number | null
  endedAt: Date
  status?: "ENDED" | "ABORTED"
  endedReason?: string | null
}

export interface IMatchRepository {
  create(data: CreateMatchData): Promise<MatchWithPlayers>
  findById(id: string): Promise<MatchWithPlayers | null>
  findByStatus(status: MatchStatus): Promise<MatchWithPlayers[]>
  countByStatus(status: MatchStatus): Promise<number>
  startLive(id: string, startedAt: Date): Promise<MatchWithPlayers | null>
  /** Fills the empty seat of a waiting private room; null if the room is no longer open. */
  attachPlayerB(id: string, data: AttachPlayerBData): Promise<MatchWithPlayers | null>
  settle(id: string, fromStatuses: MatchStatus[], data: SettleMatchData): Promise<MatchWithPlayers | null>
  /** Adds to a seat's focus ELO penalty while the match is live; returns the new total, or null if not live. */
  addFocusEloPenalty(id: string, seat: "a" | "b", amount: number): Promise<number | null>
  createSubmission(data: CreateMatchSubmissionData): Promise<MatchSubmissionRecord>
  hasAccepted(matchId: string): Promise<boolean>
  findLatestSubmissions(matchId: string): Promise<MatchSubmissionRecord[]>
  findRecentEndedByUserId(userId: string, limit: number): Promise<MatchHistoryRecord[]>
  findRecentProfileMatchesByUserId(userId: string, limit: number): Promise<ProfileMatchHistoryRecord[]>
  findPrivateHostedByHostId(hostId: string): Promise<HostedPrivateMatchRecord[]>
}
