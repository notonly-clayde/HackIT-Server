import type {
  CreateSuspensionRequestData,
  CreateWarningData,
  TournamentSuspensionRequestRecord,
  TournamentWarningRecord,
} from "../../domain/entities/tournament-discipline.entity.js"
import type { ITournamentDisciplineRepository } from "../../domain/repositories/tournament-discipline.repository.js"
import { prisma } from "./prisma.client.js"

const nameSelect = { select: { displayName: true } } as const

const warningInclude = {
  player: nameSelect,
  issuedBy: nameSelect,
} as const

const requestInclude = {
  player: nameSelect,
  requestedBy: nameSelect,
  decidedBy: nameSelect,
} as const

function toWarning(record: {
  id: string
  tournamentId: string
  playerId: string
  issuedById: string
  reason: string
  createdAt: Date
  player: { displayName: string }
  issuedBy: { displayName: string }
}): TournamentWarningRecord {
  return {
    id: record.id,
    tournamentId: record.tournamentId,
    playerId: record.playerId,
    playerDisplayName: record.player.displayName,
    issuedById: record.issuedById,
    issuedByDisplayName: record.issuedBy.displayName,
    reason: record.reason,
    createdAt: record.createdAt,
  }
}

function toRequest(record: {
  id: string
  tournamentId: string
  playerId: string
  requestedById: string
  reason: string
  status: TournamentSuspensionRequestRecord["status"]
  decidedById: string | null
  decisionNote: string | null
  decidedAt: Date | null
  createdAt: Date
  player: { displayName: string }
  requestedBy: { displayName: string }
  decidedBy: { displayName: string } | null
}): TournamentSuspensionRequestRecord {
  return {
    id: record.id,
    tournamentId: record.tournamentId,
    playerId: record.playerId,
    playerDisplayName: record.player.displayName,
    requestedById: record.requestedById,
    requestedByDisplayName: record.requestedBy.displayName,
    reason: record.reason,
    status: record.status,
    decidedById: record.decidedById,
    decidedByDisplayName: record.decidedBy?.displayName ?? null,
    decisionNote: record.decisionNote,
    decidedAt: record.decidedAt,
    createdAt: record.createdAt,
  }
}

export class PrismaTournamentDisciplineRepository implements ITournamentDisciplineRepository {
  async listWarnings(tournamentId: string): Promise<TournamentWarningRecord[]> {
    const records = await prisma.tournamentWarning.findMany({
      where: { tournamentId },
      include: warningInclude,
      orderBy: { createdAt: "desc" },
    })
    return records.map(toWarning)
  }

  async listSuspensionRequests(tournamentId: string): Promise<TournamentSuspensionRequestRecord[]> {
    const records = await prisma.tournamentSuspensionRequest.findMany({
      where: { tournamentId },
      include: requestInclude,
      orderBy: { createdAt: "desc" },
    })
    return records.map(toRequest)
  }

  async createWarning(data: CreateWarningData): Promise<TournamentWarningRecord> {
    const record = await prisma.tournamentWarning.create({ data, include: warningInclude })
    return toWarning(record)
  }

  async createSuspensionRequest(data: CreateSuspensionRequestData): Promise<TournamentSuspensionRequestRecord> {
    const record = await prisma.tournamentSuspensionRequest.create({ data, include: requestInclude })
    return toRequest(record)
  }

  async findSuspensionRequest(id: string): Promise<TournamentSuspensionRequestRecord | null> {
    const record = await prisma.tournamentSuspensionRequest.findUnique({
      where: { id },
      include: requestInclude,
    })
    return record ? toRequest(record) : null
  }

  async hasPendingSuspensionRequest(tournamentId: string, playerId: string): Promise<boolean> {
    const count = await prisma.tournamentSuspensionRequest.count({
      where: { tournamentId, playerId, status: "PENDING" },
    })
    return count > 0
  }

  async rejectSuspensionRequest(
    id: string,
    decidedById: string,
    decisionNote: string | null,
  ): Promise<TournamentSuspensionRequestRecord | null> {
    const updated = await prisma.tournamentSuspensionRequest.updateMany({
      where: { id, status: "PENDING" },
      data: { status: "REJECTED", decidedById, decisionNote, decidedAt: new Date() },
    })
    if (updated.count === 0) return null
    return this.findSuspensionRequest(id)
  }

  async disqualify(input: {
    tournamentId: string
    playerId: string
    decidedById: string
    reason: string
    requestId: string | null
    decisionNote: string | null
  }): Promise<TournamentSuspensionRequestRecord> {
    const now = new Date()

    const requestId = await prisma.$transaction(async (tx) => {
      await tx.tournamentPlayer.update({
        where: { tournamentId_userId: { tournamentId: input.tournamentId, userId: input.playerId } },
        data: { disqualifiedAt: now, disqualifyReason: input.reason },
      })

      let id = input.requestId
      if (!id) {
        const created = await tx.tournamentSuspensionRequest.create({
          data: {
            tournamentId: input.tournamentId,
            playerId: input.playerId,
            requestedById: input.decidedById,
            reason: input.reason,
            status: "APPROVED",
            decidedById: input.decidedById,
            decisionNote: input.decisionNote,
            decidedAt: now,
          },
        })
        id = created.id
      }

      await tx.tournamentSuspensionRequest.updateMany({
        where: { tournamentId: input.tournamentId, playerId: input.playerId, status: "PENDING" },
        data: {
          status: "APPROVED",
          decidedById: input.decidedById,
          decidedAt: now,
        },
      })

      if (input.requestId) {
        await tx.tournamentSuspensionRequest.update({
          where: { id: input.requestId },
          data: { decisionNote: input.decisionNote },
        })
      }

      return id
    })

    const record = await this.findSuspensionRequest(requestId)
    if (!record) {
      throw new Error("Suspension request not found after disqualification")
    }
    return record
  }
}
