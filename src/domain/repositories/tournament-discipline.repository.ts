import type {
  CreateSuspensionRequestData,
  CreateWarningData,
  TournamentSuspensionRequestRecord,
  TournamentWarningRecord,
} from "../entities/tournament-discipline.entity.js"

export interface ITournamentDisciplineRepository {
  listWarnings(tournamentId: string): Promise<TournamentWarningRecord[]>
  listSuspensionRequests(tournamentId: string): Promise<TournamentSuspensionRequestRecord[]>
  createWarning(data: CreateWarningData): Promise<TournamentWarningRecord>
  createSuspensionRequest(data: CreateSuspensionRequestData): Promise<TournamentSuspensionRequestRecord>
  findSuspensionRequest(id: string): Promise<TournamentSuspensionRequestRecord | null>
  hasPendingSuspensionRequest(tournamentId: string, playerId: string): Promise<boolean>
  /** Returns null when the request is no longer pending. */
  rejectSuspensionRequest(
    id: string,
    decidedById: string,
    decisionNote: string | null,
  ): Promise<TournamentSuspensionRequestRecord | null>
  /**
   * Disqualifies the player and resolves every pending request for them as approved.
   * When `requestId` is null an approved request is recorded on behalf of the decider.
   */
  disqualify(input: {
    tournamentId: string
    playerId: string
    decidedById: string
    reason: string
    requestId: string | null
    decisionNote: string | null
  }): Promise<TournamentSuspensionRequestRecord>
}
