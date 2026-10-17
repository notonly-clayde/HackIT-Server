/** Players who must accept score before the contest can auto-end (enrolled, not DQ). */
export type EligiblePlayerFinishState = {
  role: "host" | "mod" | "player"
  disqualifiedAt: Date | null
  finishedAt: Date | null
}

export function allEligiblePlayersAcceptedScore(players: EligiblePlayerFinishState[]): boolean {
  const eligible = players.filter((p) => p.role === "player" && p.disqualifiedAt === null)
  if (eligible.length === 0) {
    return false
  }
  return eligible.every((p) => p.finishedAt !== null)
}
