export type LobbyPlayerRole = "host" | "mod" | "player"

export type LobbyPlayer = {
  id: string
  displayName: string
  avatarUrl: string | null
  eloTournament: number
  role: LobbyPlayerRole
  joinedAt: Date
  focusPointDeduction: number
  disqualifiedAt: Date | null
  disqualifyReason: string | null
  finishedAt: Date | null
}

export type LobbyState = {
  tournamentId: string
  players: LobbyPlayer[]
  playerCount: number
  maxPlayers: number
}

export type LobbyCountUpdate = {
  tournamentId: string
  playerCount: number
  maxPlayers: number
}
