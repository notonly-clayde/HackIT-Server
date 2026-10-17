export type TournamentEndReasonDto = "host" | "timer" | "all_players_finished"

export type TournamentLiveStateDto = {
  tournamentId: string
  status: "Open" | "Soon" | "Live" | "Ended"
  liveStartedAt: string | null
  pausedAt: string | null
  resumeAt: string | null
  pausedTotalMs: number
  endedAt: string | null
  endReason: TournamentEndReasonDto | null
  durationMinutes: number
}

export type TournamentLiveStateNotifier = {
  notify: (state: TournamentLiveStateDto) => void
}

export function createTournamentLiveStateNotifier(): TournamentLiveStateNotifier {
  return { notify: () => {} }
}
