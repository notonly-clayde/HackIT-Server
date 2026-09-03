export type WorkspaceLanguage = "python" | "javascript" | "cpp"

export type TournamentPlayerSessionRecord = {
  tournamentId: string
  userId: string
  activeProblemId: string | null
  language: WorkspaceLanguage
  updatedAt: Date
}

export type TournamentWorkspaceRecord = {
  tournamentId: string
  userId: string
  problemId: string
  sourceCode: string
  updatedAt: Date
}

export type SaveMyWorkspaceData = {
  problemId?: string
  sourceCode?: string
  activeProblemId?: string | null
  language?: WorkspaceLanguage
}
