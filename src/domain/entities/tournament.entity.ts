export type BattleType = "ONE_V_ONE" | "FREE_FOR_ALL"
export type TournamentStatus = "OPEN" | "SOON" | "LIVE" | "ENDED"
export type Visibility = "PUBLIC" | "PRIVATE"
export type StartMode = "MANUAL" | "AUTO"

export type TournamentModerator = {
  id: string
  displayName: string
  email: string
}

export type Tournament = {
  id: string
  name: string
  type: BattleType
  scheduledAt: Date
  status: TournamentStatus
  playerCount: number
  maxPlayers: number
  durationMinutes: number
  description: string
  visibility: Visibility
  startMode: StartMode
  passwordProtected: boolean
  hostId: string
  liveStartedAt: Date | null
  pausedAt: Date | null
  resumeAt: Date | null
  pausedTotalMs: number
  endedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type TournamentWithHost = Tournament & {
  hostDisplayName: string
  moderators: TournamentModerator[]
  passwordHash?: string | null
}

export type TournamentParticipation = {
  id: string
  name: string
  type: BattleType
  visibility: Visibility
  endedAt: Date
}

export type TournamentFilters = {
  search?: string
  type?: "ffa" | "1v1"
  status?: "Open" | "Soon" | "Live" | "Ended"
}

export type CreateTournamentData = {
  name: string
  type: BattleType
  scheduledAt: Date
  status: TournamentStatus
  maxPlayers: number
  durationMinutes: number
  description: string
  visibility: Visibility
  startMode: StartMode
  passwordProtected: boolean
  passwordHash: string | null
  hostId: string
  moderatorIds: string[]
}

export type UpdateTournamentData = {
  name?: string
  type?: BattleType
  scheduledAt?: Date
  status?: TournamentStatus
  maxPlayers?: number
  durationMinutes?: number
  description?: string
  visibility?: Visibility
  startMode?: StartMode
  passwordProtected?: boolean
  passwordHash?: string | null
  liveStartedAt?: Date | null
  pausedAt?: Date | null
  resumeAt?: Date | null
  pausedTotalMs?: number
  endedAt?: Date | null
  moderatorIds?: string[]
}
