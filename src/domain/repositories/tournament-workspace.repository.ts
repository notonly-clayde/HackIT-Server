import type {
  SaveMyWorkspaceData,
  TournamentPlayerSessionRecord,
  TournamentWorkspaceRecord,
  WorkspaceLanguage,
} from "../entities/tournament-workspace.entity.js"

export interface ITournamentWorkspaceRepository {
  findSession(tournamentId: string, userId: string): Promise<TournamentPlayerSessionRecord | null>
  findEntries(tournamentId: string, userId: string): Promise<TournamentWorkspaceRecord[]>
  findEntry(
    tournamentId: string,
    userId: string,
    problemId: string,
  ): Promise<TournamentWorkspaceRecord | null>
  saveMyWorkspace(
    tournamentId: string,
    userId: string,
    data: SaveMyWorkspaceData,
  ): Promise<{
    session: TournamentPlayerSessionRecord
    entry: TournamentWorkspaceRecord | null
  }>
}

export function normalizeWorkspaceLanguage(language: string): WorkspaceLanguage {
  const normalized = language.toLowerCase()
  if (normalized === "js" || normalized === "javascript") return "javascript"
  if (normalized === "py" || normalized === "python") return "python"
  if (normalized === "c++" || normalized === "cpp") return "cpp"
  return "python"
}
