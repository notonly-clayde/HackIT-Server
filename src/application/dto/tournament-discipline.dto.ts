import { z } from "zod"

export const disciplineReasonSchema = z.object({
  reason: z.string().trim().min(1, "Reason is required").max(500),
})

export const disciplineDecisionSchema = z.object({
  note: z.string().trim().max(500).optional(),
})

export type TournamentWarningDto = {
  id: string
  playerId: string
  playerDisplayName: string
  issuedById: string
  issuedByDisplayName: string
  reason: string
  createdAt: string
}

export type WarnPlayerResultDto = TournamentWarningDto & {
  playerWarningCount: number
  maxWarnings: number
  disqualified: boolean
}

export type TournamentSuspensionRequestDto = {
  id: string
  playerId: string
  playerDisplayName: string
  requestedById: string
  requestedByDisplayName: string
  reason: string
  status: "pending" | "approved" | "rejected"
  decidedById: string | null
  decidedByDisplayName: string | null
  decisionNote: string | null
  decidedAt: string | null
  createdAt: string
}

export type TournamentDisciplineDto = {
  warnings: TournamentWarningDto[]
  suspensionRequests: TournamentSuspensionRequestDto[]
}
