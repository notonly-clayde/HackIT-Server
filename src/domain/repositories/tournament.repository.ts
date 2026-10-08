import type {
  CreateTournamentData,
  TournamentFilters,
  TournamentParticipation,
  TournamentWithHost,
  UpdateTournamentData,
} from "../entities/tournament.entity.js"

export interface ITournamentRepository {
  findMany(filters: TournamentFilters): Promise<TournamentWithHost[]>
  findByIdWithHost(id: string): Promise<TournamentWithHost | null>
  create(data: CreateTournamentData): Promise<TournamentWithHost>
  update(id: string, data: UpdateTournamentData): Promise<TournamentWithHost>
  delete(id: string): Promise<void>
  findPasswordHash(id: string): Promise<string | null>
  findRecentEndedParticipationsByUserId(
    userId: string,
    limit: number,
    options: { publicOnly: boolean },
  ): Promise<TournamentParticipation[]>
}
