import type { LobbyPlayer, LobbyState } from "../entities/lobby.entity.js"

export type JoinLobbyData = {
  tournamentId: string
  userId: string
  role: "MOD" | "PLAYER"
}

export interface ILobbyRepository {
  findLobbyState(tournamentId: string): Promise<LobbyState | null>
  findPlayer(tournamentId: string, userId: string): Promise<LobbyPlayer | null>
  join(data: JoinLobbyData): Promise<LobbyState>
  leave(tournamentId: string, userId: string): Promise<LobbyState | null>
  syncPlayerCount(tournamentId: string): Promise<number>
  isModerator(tournamentId: string, userId: string): Promise<boolean>
  findPasswordHash(tournamentId: string): Promise<string | null>
  findParticipantRole(tournamentId: string, userId: string): Promise<"PLAYER" | "MOD" | null>
  findTournamentForJoin(tournamentId: string): Promise<{
    id: string
    status: "OPEN" | "SOON" | "LIVE" | "ENDED"
    maxPlayers: number
    playerCount: number
    passwordProtected: boolean
    hostId: string
  } | null>
}
