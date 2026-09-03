export type UserRole = "USER" | "ADMIN"
export type UserStatus = "ACTIVE" | "SUSPENDED"

export type User = {
  id: string
  email: string
  name: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
  emailVerified: boolean
  role: UserRole
  status: UserStatus
  suspendedAt: Date | null
  suspendReason: string | null
  elo1v1: number
  eloTournament: number
  peakElo1v1: number
  winStreak1v1: number
  wins: number
  draws: number
  matchCount: number
  createdAt: Date
  updatedAt: Date
  lastSyncedAt: Date
}

export type AuthClaims = {
  userId: string
  email: string
  name: string
  emailVerified: boolean
  avatarUrl: string | null
}

export type UpdateUserProfileInput = {
  displayName?: string
  avatarUrl?: string | null
  bio?: string | null
}

export type UpdateMatchStatsInput = {
  elo1v1: number
  peakElo1v1: number
  winStreak1v1: number
  wins: number
  draws: number
  matchCount: number
}
