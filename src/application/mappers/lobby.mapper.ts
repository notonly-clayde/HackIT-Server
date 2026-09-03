import type { LobbyPlayer, LobbyState } from "../../domain/entities/lobby.entity.js"

export type LobbyPlayerDto = {
  id: string
  displayName: string
  avatarUrl: string | null
  eloTournament: number
  role: "host" | "mod" | "player"
  joinedAt: string
}

export type LobbyStateDto = {
  tournamentId: string
  players: LobbyPlayerDto[]
  playerCount: number
  maxPlayers: number
}

export function toLobbyPlayerDto(player: LobbyPlayer): LobbyPlayerDto {
  return {
    id: player.id,
    displayName: player.displayName,
    avatarUrl: player.avatarUrl,
    eloTournament: player.eloTournament,
    role: player.role,
    joinedAt: player.joinedAt.toISOString(),
  }
}

export function toLobbyStateDto(state: LobbyState): LobbyStateDto {
  return {
    tournamentId: state.tournamentId,
    players: state.players.map(toLobbyPlayerDto),
    playerCount: state.playerCount,
    maxPlayers: state.maxPlayers,
  }
}
