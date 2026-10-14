export type SuspensionRequestStatus = "PENDING" | "APPROVED" | "REJECTED"

export type TournamentWarningRecord = {
  id: string
  tournamentId: string
  playerId: string
  playerDisplayName: string
  issuedById: string
  issuedByDisplayName: string
  reason: string
  createdAt: Date
}

export type TournamentSuspensionRequestRecord = {
  id: string
  tournamentId: string
  playerId: string
  playerDisplayName: string
  requestedById: string
  requestedByDisplayName: string
  reason: string
  status: SuspensionRequestStatus
  decidedById: string | null
  decidedByDisplayName: string | null
  decisionNote: string | null
  decidedAt: Date | null
  createdAt: Date
}

export type CreateWarningData = {
  tournamentId: string
  playerId: string
  issuedById: string
  reason: string
}

export type CreateSuspensionRequestData = {
  tournamentId: string
  playerId: string
  requestedById: string
  reason: string
}
