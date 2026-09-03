import type {
  CreateTournamentSubmissionData,
  TournamentSubmissionRecord,
} from "../entities/tournament-submission.entity.js"

export interface ITournamentSubmissionRepository {
  create(data: CreateTournamentSubmissionData): Promise<TournamentSubmissionRecord>
  findByTournamentId(tournamentId: string): Promise<TournamentSubmissionRecord[]>
}
