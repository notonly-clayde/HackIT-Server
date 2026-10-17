import { ELO_FLOOR, expectedScore } from "../versus/elo.js"

/** K-factor for tournament placement ELO (similar to medium 1v1 stakes). */
export const TOURNAMENT_ELO_K = 24

/**
 * Placement score for tournament ELO updates.
 * Top 3 gain; last place loses when more than 3 players.
 * With exactly 3 players, everyone gains (FAQ).
 */
export function tournamentPlacementScore(rank: number, totalPlayers: number): number | null {
  if (totalPlayers <= 0 || rank < 1 || rank > totalPlayers) return null

  if (totalPlayers === 1) {
    return rank === 1 ? 1 : null
  }

  if (totalPlayers === 3) {
    if (rank === 1) return 1
    if (rank === 2) return 0.7
    if (rank === 3) return 0.4
    return null
  }

  if (rank <= 3) {
    if (rank === 1) return 1
    if (rank === 2) return 0.75
    return 0.6
  }

  if (rank === totalPlayers) {
    return 0
  }

  return null
}

export function averageOpponentTournamentElo(
  playerUserId: string,
  participants: Array<{ userId: string; eloTournament: number }>,
): number {
  const others = participants.filter((p) => p.userId !== playerUserId)
  if (others.length === 0) {
    return participants.find((p) => p.userId === playerUserId)?.eloTournament ?? 1200
  }
  const sum = others.reduce((acc, p) => acc + p.eloTournament, 0)
  return sum / others.length
}

export function computeTournamentEloAfter(
  currentElo: number,
  rank: number,
  totalPlayers: number,
  field: Array<{ userId: string; eloTournament: number }>,
  playerUserId: string,
): number {
  const score = tournamentPlacementScore(rank, totalPlayers)
  if (score === null) {
    return currentElo
  }

  const opponent = averageOpponentTournamentElo(playerUserId, field)
  const expected = expectedScore(currentElo, opponent)
  const next = Math.round(currentElo + TOURNAMENT_ELO_K * (score - expected))
  return Math.max(ELO_FLOOR, next)
}
