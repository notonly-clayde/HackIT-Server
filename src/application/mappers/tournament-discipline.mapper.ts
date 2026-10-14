import type {
  TournamentSuspensionRequestRecord,
  TournamentWarningRecord,
} from "../../domain/entities/tournament-discipline.entity.js"
import type {
  TournamentSuspensionRequestDto,
  TournamentWarningDto,
} from "../dto/tournament-discipline.dto.js"

export function toTournamentWarningDto(record: TournamentWarningRecord): TournamentWarningDto {
  return {
    id: record.id,
    playerId: record.playerId,
    playerDisplayName: record.playerDisplayName,
    issuedById: record.issuedById,
    issuedByDisplayName: record.issuedByDisplayName,
    reason: record.reason,
    createdAt: record.createdAt.toISOString(),
  }
}

const statusLabels = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const

export function toTournamentSuspensionRequestDto(
  record: TournamentSuspensionRequestRecord,
): TournamentSuspensionRequestDto {
  return {
    id: record.id,
    playerId: record.playerId,
    playerDisplayName: record.playerDisplayName,
    requestedById: record.requestedById,
    requestedByDisplayName: record.requestedByDisplayName,
    reason: record.reason,
    status: statusLabels[record.status],
    decidedById: record.decidedById,
    decidedByDisplayName: record.decidedByDisplayName,
    decisionNote: record.decisionNote,
    decidedAt: record.decidedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
  }
}
