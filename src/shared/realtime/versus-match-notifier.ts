import type { VersusMatchDto, VersusMatchEndedDto } from "../../application/dto/versus.dto.js"

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
}

export function createVersusMatchNotifier(): VersusMatchNotifier {
  return {
    notifyState: () => undefined,
    notifyStarted: () => undefined,
    notifyEnded: () => undefined,
  }
}
