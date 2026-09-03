export type TournamentWorkspaceUpdateDto = {
  tournamentId: string
  userId: string
  displayName: string
  activeProblemId: string | null
  language: "python" | "javascript" | "cpp"
  problemId: string
  sourceCode: string
  updatedAt: string
}

export type TournamentWorkspaceNotifier = {
  notify: (update: TournamentWorkspaceUpdateDto) => void
}

export function createTournamentWorkspaceNotifier(): TournamentWorkspaceNotifier {
  return { notify: () => {} }
}
