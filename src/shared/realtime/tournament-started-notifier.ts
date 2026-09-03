export type TournamentStartedNotifier = {
  notify: (tournamentId: string) => void
}

export function createTournamentStartedNotifier(): TournamentStartedNotifier {
  return { notify: () => {} }
}
