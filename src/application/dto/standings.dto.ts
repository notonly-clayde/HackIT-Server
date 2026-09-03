export type StandingsEntryDto = {
  rank: number
  userId: string
  displayName: string
  solved: number
  penalty: number
  score: number
}

export type TournamentStandingsDto = {
  tournamentId: string
  updatedAt: string
  entries: StandingsEntryDto[]
}
