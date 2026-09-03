import type { ProblemDifficulty } from "../../domain/entities/problem.entity.js"

export type QueueEntry = {
  userId: string
  socketId: string
  elo: number
  difficulty: ProblemDifficulty
  queuedAt: number
}

type Pair = {
  a: QueueEntry
  b: QueueEntry
}

const START_WINDOW = 100
const WINDOW_STEP = 100
const WINDOW_EXPAND_MS = 5_000
const MAX_WINDOW = 400

export class VersusMatchmakingQueue {
  private readonly pools = new Map<ProblemDifficulty, QueueEntry[]>()

  enqueue(entry: QueueEntry): void {
    this.removeUser(entry.userId)
    const pool = this.pools.get(entry.difficulty) ?? []
    pool.push(entry)
    this.pools.set(entry.difficulty, pool)
  }

  removeUser(userId: string): QueueEntry | null {
    let removed: QueueEntry | null = null
    for (const [difficulty, pool] of this.pools) {
      const next = pool.filter((entry) => {
        if (entry.userId === userId) {
          removed = entry
          return false
        }
        return true
      })
      this.pools.set(difficulty, next)
    }
    return removed
  }

  removeSocket(socketId: string): QueueEntry | null {
    let removed: QueueEntry | null = null
    for (const [difficulty, pool] of this.pools) {
      const next = pool.filter((entry) => {
        if (entry.socketId === socketId) {
          removed = entry
          return false
        }
        return true
      })
      this.pools.set(difficulty, next)
    }
    return removed
  }

  get(userId: string): QueueEntry | null {
    for (const pool of this.pools.values()) {
      const found = pool.find((entry) => entry.userId === userId)
      if (found) return found
    }
    return null
  }

  tryPair(difficulty: ProblemDifficulty, now = Date.now()): Pair | null {
    const pool = this.pools.get(difficulty) ?? []
    if (pool.length < 2) return null

    for (let i = 0; i < pool.length; i += 1) {
      const a = pool[i]!
      const window = this.windowFor(a, now)
      let best: { index: number; diff: number } | null = null

      for (let j = i + 1; j < pool.length; j += 1) {
        const b = pool[j]!
        if (a.userId === b.userId) continue
        const diff = Math.abs(a.elo - b.elo)
        if (diff > window) continue
        if (!best || diff < best.diff) {
          best = { index: j, diff }
        }
      }

      if (best) {
        const b = pool[best.index]!
        const remaining = pool.filter((_, idx) => idx !== i && idx !== best!.index)
        this.pools.set(difficulty, remaining)
        return { a, b }
      }
    }

    return null
  }

  private windowFor(entry: QueueEntry, now: number): number {
    const waited = Math.max(0, now - entry.queuedAt)
    const steps = Math.floor(waited / WINDOW_EXPAND_MS)
    return Math.min(MAX_WINDOW, START_WINDOW + steps * WINDOW_STEP)
  }
}
