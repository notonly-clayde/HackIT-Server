import type { TournamentPlayerRole } from "@prisma/client"
import type { LobbyPlayer, LobbyState } from "../../domain/entities/lobby.entity.js"
import type { ILobbyRepository, JoinLobbyData } from "../../domain/repositories/lobby.repository.js"
import { prisma } from "./prisma.client.js"

const playerInclude = {
  user: {
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      eloTournament: true,
    },
  },
} as const

function toLobbyRole(role: TournamentPlayerRole): LobbyPlayer["role"] {
  if (role === "HOST") return "host"
  if (role === "MOD") return "mod"
  return "player"
}

function toLobbyPlayer(record: {
  role: TournamentPlayerRole
  joinedAt: Date
  user: {
    id: string
    displayName: string
    avatarUrl: string | null
    eloTournament: number
  }
}): LobbyPlayer {
  return {
    id: record.user.id,
    displayName: record.user.displayName,
    avatarUrl: record.user.avatarUrl,
    eloTournament: record.user.eloTournament,
    role: toLobbyRole(record.role),
    joinedAt: record.joinedAt,
  }
}

async function buildLobbyState(tournamentId: string): Promise<LobbyState | null> {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { id: true, maxPlayers: true, playerCount: true },
  })

  if (!tournament) return null

  const records = await prisma.tournamentPlayer.findMany({
    where: { tournamentId },
    include: playerInclude,
    orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
  })

  const players = records.map(toLobbyPlayer)

  return {
    tournamentId,
    players,
    playerCount: tournament.playerCount,
    maxPlayers: tournament.maxPlayers,
  }
}

export class PrismaLobbyRepository implements ILobbyRepository {
  async findLobbyState(tournamentId: string): Promise<LobbyState | null> {
    return buildLobbyState(tournamentId)
  }

  async findPlayer(tournamentId: string, userId: string): Promise<LobbyPlayer | null> {
    const record = await prisma.tournamentPlayer.findUnique({
      where: { tournamentId_userId: { tournamentId, userId } },
      include: playerInclude,
    })

    return record ? toLobbyPlayer(record) : null
  }

  async join(data: JoinLobbyData): Promise<LobbyState> {
    await prisma.$transaction(async (tx) => {
      await tx.tournamentPlayer.upsert({
        where: {
          tournamentId_userId: {
            tournamentId: data.tournamentId,
            userId: data.userId,
          },
        },
        create: {
          tournamentId: data.tournamentId,
          userId: data.userId,
          role: data.role,
        },
        update: {
          role: data.role,
        },
      })

      const count = await tx.tournamentPlayer.count({
        where: { tournamentId: data.tournamentId },
      })

      await tx.tournament.update({
        where: { id: data.tournamentId },
        data: { playerCount: count },
      })
    })

    const state = await buildLobbyState(data.tournamentId)
    if (!state) {
      throw new Error("Tournament not found after join")
    }

    return state
  }

  async leave(tournamentId: string, userId: string): Promise<LobbyState | null> {
    const existing = await prisma.tournamentPlayer.findUnique({
      where: { tournamentId_userId: { tournamentId, userId } },
    })

    if (!existing) {
      return buildLobbyState(tournamentId)
    }

    await prisma.$transaction(async (tx) => {
      await tx.tournamentPlayer.delete({
        where: { tournamentId_userId: { tournamentId, userId } },
      })

      const count = await tx.tournamentPlayer.count({
        where: { tournamentId },
      })

      await tx.tournament.update({
        where: { id: tournamentId },
        data: { playerCount: count },
      })
    })

    return buildLobbyState(tournamentId)
  }

  async syncPlayerCount(tournamentId: string): Promise<number> {
    const count = await prisma.tournamentPlayer.count({
      where: { tournamentId },
    })

    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { playerCount: count },
    })

    return count
  }

  async isModerator(tournamentId: string, userId: string): Promise<boolean> {
    const mod = await prisma.tournamentModerator.findUnique({
      where: { tournamentId_userId: { tournamentId, userId } },
    })

    return Boolean(mod)
  }

  async findPasswordHash(tournamentId: string): Promise<string | null> {
    const record = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { passwordHash: true },
    })

    return record?.passwordHash ?? null
  }

  async findTournamentForJoin(tournamentId: string) {
    return prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        id: true,
        status: true,
        maxPlayers: true,
        playerCount: true,
        passwordProtected: true,
        hostId: true,
      },
    })
  }
}
