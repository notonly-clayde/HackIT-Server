import type { TournamentProblemEntry } from "../entities/problem.entity.js"

export interface ITournamentProblemRepository {
  findByTournamentId(tournamentId: string): Promise<TournamentProblemEntry[]>
  attach(tournamentId: string, problemId: string, order: number, points: number): Promise<TournamentProblemEntry[]>
  detach(tournamentId: string, problemId: string): Promise<TournamentProblemEntry[]>
  updateEntry(
    tournamentId: string,
    problemId: string,
    data: { order?: number; points?: number },
  ): Promise<TournamentProblemEntry[]>
  reorder(
    tournamentId: string,
    order: { problemId: string; order: number }[],
  ): Promise<TournamentProblemEntry[]>
  countHiddenTests(tournamentId: string): Promise<number>
}
