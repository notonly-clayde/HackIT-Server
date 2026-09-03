export type TournamentLiveStateDto = {
  tournamentId: string
  status: "Open" | "Soon" | "Live" | "Ended"
  liveStartedAt: string | null
  pausedAt: string | null
  resumeAt: string | null
  pausedTotalMs: number
  endedAt: string | null
  durationMinutes: number
}

export type TournamentLiveStateNotifier = {
  notify: (state: TournamentLiveStateDto) => void
}

export function createTournamentLiveStateNotifier(): TournamentLiveStateNotifier {
  return { notify: () => {} }
}
