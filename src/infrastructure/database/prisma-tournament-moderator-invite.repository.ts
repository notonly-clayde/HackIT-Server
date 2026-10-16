import type {
  PendingModeratorInviteSummary,
  TournamentModeratorInvite,
  TournamentModeratorInviteWithDetails,
} from "../../domain/entities/tournament-moderator-invite.entity.js"
import type {
  ITournamentModeratorInviteRepository,
  SyncModeratorInvitesResult,
} from "../../domain/repositories/tournament-moderator-invite.repository.js"
import { prisma } from "./prisma.client.js"

const tournamentStatusLabels = {
  OPEN: "Open",
  SOON: "Soon",
  LIVE: "Live",
  ENDED: "Ended",
} as const

function toInvite(record: {
  id: string
  tournamentId: string
  userId: string
  invitedById: string
  status: "PENDING" | "DECLINED"
  createdAt: Date
  respondedAt: Date | null
}): TournamentModeratorInvite {
  return {
    id: record.id,
    tournamentId: record.tournamentId,
    userId: record.userId,
    invitedById: record.invitedById,
    status: record.status,
    createdAt: record.createdAt,
    respondedAt: record.respondedAt,
  }
}

export class PrismaTournamentModeratorInviteRepository implements ITournamentModeratorInviteRepository {
  async findPendingForUser(userId: string): Promise<PendingModeratorInviteSummary[]> {
    const rows = await prisma.tournamentModeratorInvite.findMany({
      where: {
        userId,
        status: "PENDING",
      },
      include: {
        tournament: {
          select: {
            name: true,
            scheduledAt: true,
            status: true,
            host: { select: { displayName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return rows.map((row) => ({
      id: row.id,
      tournamentId: row.tournamentId,
      tournamentName: row.tournament.name,
      hostDisplayName: row.tournament.host.displayName,
      invitedAt: row.createdAt,
      tournamentStatus: tournamentStatusLabels[row.tournament.status],
    }))
  }

  async findPendingForTournament(tournamentId: string): Promise<TournamentModeratorInviteWithDetails[]> {
    const rows = await prisma.tournamentModeratorInvite.findMany({
      where: { tournamentId, status: "PENDING" },
      include: {
        tournament: {
          select: {
            name: true,
            scheduledAt: true,
            host: { select: { displayName: true } },
          },
        },
        user: { select: { displayName: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    })

    return rows.map((row) => ({
      ...toInvite(row),
      tournamentName: row.tournament.name,
      hostDisplayName: row.tournament.host.displayName,
      scheduledAt: row.tournament.scheduledAt,
      inviteeDisplayName: row.user.displayName,
      inviteeEmail: row.user.email,
    }))
  }

  async findPending(tournamentId: string, userId: string): Promise<TournamentModeratorInvite | null> {
    const row = await prisma.tournamentModeratorInvite.findFirst({
      where: { tournamentId, userId, status: "PENDING" },
    })
    return row ? toInvite(row) : null
  }

  async syncForDesiredModerators(
    tournamentId: string,
    hostId: string,
    desiredUserIds: string[],
  ): Promise<SyncModeratorInvitesResult> {
    const desired = [...new Set(desiredUserIds.filter((id) => id !== hostId))]

    const accepted = await prisma.tournamentModerator.findMany({
      where: { tournamentId },
      select: { userId: true },
    })
    const acceptedIds = new Set(accepted.map((row) => row.userId))

    const toRemoveFromMods = accepted.filter((row) => !desired.includes(row.userId)).map((row) => row.userId)
    const toInvite = desired.filter((id) => !acceptedIds.has(id))

    const newlyInvitedUserIds: string[] = []

    await prisma.$transaction(async (tx) => {
      if (toRemoveFromMods.length > 0) {
        await tx.tournamentModerator.deleteMany({
          where: { tournamentId, userId: { in: toRemoveFromMods } },
        })
      }

      if (desired.length === 0) {
        await tx.tournamentModeratorInvite.deleteMany({ where: { tournamentId } })
      } else {
        await tx.tournamentModeratorInvite.deleteMany({
          where: { tournamentId, userId: { notIn: desired } },
        })
      }

      for (const userId of toInvite) {
        const existing = await tx.tournamentModeratorInvite.findUnique({
          where: { tournamentId_userId: { tournamentId, userId } },
        })

        if (existing?.status === "PENDING") continue

        if (existing?.status === "DECLINED") {
          await tx.tournamentModeratorInvite.update({
            where: { id: existing.id },
            data: {
              status: "PENDING",
              invitedById: hostId,
              respondedAt: null,
              createdAt: new Date(),
            },
          })
          newlyInvitedUserIds.push(userId)
          continue
        }

        await tx.tournamentModeratorInvite.create({
          data: {
            tournamentId,
            userId,
            invitedById: hostId,
            status: "PENDING",
          },
        })
        newlyInvitedUserIds.push(userId)
      }
    })

    return { newlyInvitedUserIds }
  }

  async accept(tournamentId: string, userId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const invite = await tx.tournamentModeratorInvite.findFirst({
        where: { tournamentId, userId, status: "PENDING" },
      })
      if (!invite) return

      await tx.tournamentModerator.upsert({
        where: { tournamentId_userId: { tournamentId, userId } },
        create: { tournamentId, userId },
        update: {},
      })

      const removed = await tx.tournamentPlayer.deleteMany({
        where: { tournamentId, userId },
      })
      if (removed.count > 0) {
        const playerCount = await tx.tournamentPlayer.count({ where: { tournamentId } })
        await tx.tournament.update({ where: { id: tournamentId }, data: { playerCount } })
      }

      await tx.tournamentModeratorInvite.delete({ where: { id: invite.id } })
    })
  }

  async decline(tournamentId: string, userId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const invite = await tx.tournamentModeratorInvite.findFirst({
        where: { tournamentId, userId, status: "PENDING" },
      })
      if (!invite) return

      await tx.tournamentModeratorInvite.update({
        where: { id: invite.id },
        data: { status: "DECLINED", respondedAt: new Date() },
      })
    })
  }
}
