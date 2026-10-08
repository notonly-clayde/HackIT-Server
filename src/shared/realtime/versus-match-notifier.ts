import type { VersusMatchDto, VersusMatchEndedDto } from "../../application/dto/versus.dto.js"
import type { ReadyMatch } from "../../domain/entities/match.entity.js"

export type VersusStartedEvent = {
  matchId: string
  status: "live"
  startedAt: string
  playerAId: string
  playerBId: string
}

export type VersusMatchNotifier = {
  notifyState: (match: VersusMatchDto) => void
  notifyStarted: (event: VersusStartedEvent) => void
  notifyEnded: (event: VersusMatchEndedDto) => void
  /** Both seats are filled: join players to the match room, announce it, and schedule the lobby countdown. */
  notifyLobbyReady: (match: ReadyMatch) => void
}

export function createVersusMatchNotifier(): VersusMatchNotifier {
  return {
    notifyState: () => undefined,
    notifyStarted: () => undefined,
    notifyEnded: () => undefined,
    notifyLobbyReady: () => undefined,
  }
}
