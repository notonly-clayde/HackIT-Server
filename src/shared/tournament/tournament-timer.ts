export type TournamentTimerInput = {
  durationMinutes: number
  liveStartedAt: Date | null
  pausedAt: Date | null
  pausedTotalMs: number
  endedAt: Date | null
  status: "OPEN" | "SOON" | "LIVE" | "ENDED"
  now?: Date
}

export function computeRemainingMs(input: TournamentTimerInput): number | null {
  if (!input.liveStartedAt || input.status === "OPEN" || input.status === "SOON") {
    return null
  }

  const now = input.now ?? new Date()
  const endReference = input.endedAt ?? now
  const pauseTail =
    input.pausedAt && !input.endedAt ? endReference.getTime() - input.pausedAt.getTime() : 0

  const elapsed =
    endReference.getTime() -
    input.liveStartedAt.getTime() -
    input.pausedTotalMs -
    pauseTail

  return Math.max(0, input.durationMinutes * 60_000 - elapsed)
}

export function isTimerPaused(input: Pick<TournamentTimerInput, "pausedAt" | "endedAt">): boolean {
  return Boolean(input.pausedAt && !input.endedAt)
}
