export type TournamentStandingsDto = {
  tournamentId: string
  updatedAt: string
  entries: {
    rank: number
    userId: string
    displayName: string
    solved: number
    penalty: number
    score: number
  }[]
}

export type TournamentStandingsNotifier = {
  notify: (standings: TournamentStandingsDto) => void
}

export function createTournamentStandingsNotifier(): TournamentStandingsNotifier {
  return { notify: () => {} }
}
