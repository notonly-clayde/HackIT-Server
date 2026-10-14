export type TournamentPlayerWarnedDto = {
  tournamentId: string
  playerId: string
  reason: string
  issuedBy: string
  at: string
}

export type TournamentPlayerDisqualifiedDto = {
  tournamentId: string
  playerId: string
  reason: string
  at: string
}

export type TournamentDisciplineNotifier = {
  notifyWarned: (event: TournamentPlayerWarnedDto) => void
  notifyDisqualified: (event: TournamentPlayerDisqualifiedDto) => void
  notifyUpdated: (tournamentId: string) => void
}

export function createTournamentDisciplineNotifier(): TournamentDisciplineNotifier {
  return {
    notifyWarned: () => {},
    notifyDisqualified: () => {},
    notifyUpdated: () => {},
  }
}
