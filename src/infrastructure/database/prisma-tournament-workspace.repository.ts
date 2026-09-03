import type {
  SaveMyWorkspaceData,
  TournamentPlayerSessionRecord,
  TournamentWorkspaceRecord,
  WorkspaceLanguage,
} from "../../domain/entities/tournament-workspace.entity.js"
import type { ITournamentWorkspaceRepository } from "../../domain/repositories/tournament-workspace.repository.js"
import { normalizeWorkspaceLanguage } from "../../domain/repositories/tournament-workspace.repository.js"
import { prisma } from "./prisma.client.js"

function toSession(record: {
  tournamentId: string
  userId: string
  activeProblemId: string | null
  language: string
  updatedAt: Date
}): TournamentPlayerSessionRecord {
  return {
    tournamentId: record.tournamentId,
    userId: record.userId,
    activeProblemId: record.activeProblemId,
    language: normalizeWorkspaceLanguage(record.language),
    updatedAt: record.updatedAt,
  }
}

function toEntry(record: {
  tournamentId: string
  userId: string
  problemId: string
  sourceCode: string
  updatedAt: Date
}): TournamentWorkspaceRecord {
  return {
    tournamentId: record.tournamentId,
    userId: record.userId,
    problemId: record.problemId,
    sourceCode: record.sourceCode,
    updatedAt: record.updatedAt,
  }
}

export class PrismaTournamentWorkspaceRepository implements ITournamentWorkspaceRepository {
  async findSession(tournamentId: string, userId: string): Promise<TournamentPlayerSessionRecord | null> {
    const record = await prisma.tournamentPlayerSession.findUnique({
      where: { tournamentId_userId: { tournamentId, userId } },
    })

    return record ? toSession(record) : null
  }

  async findEntries(tournamentId: string, userId: string): Promise<TournamentWorkspaceRecord[]> {
    const records = await prisma.tournamentWorkspace.findMany({
      where: { tournamentId, userId },
      orderBy: { updatedAt: "asc" },
    })

    return records.map(toEntry)
  }

  async findEntry(
    tournamentId: string,
    userId: string,
    problemId: string,
  ): Promise<TournamentWorkspaceRecord | null> {
    const record = await prisma.tournamentWorkspace.findUnique({
      where: {
        tournamentId_userId_problemId: { tournamentId, userId, problemId },
      },
    })

    return record ? toEntry(record) : null
  }

  async saveMyWorkspace(
    tournamentId: string,
    userId: string,
    data: SaveMyWorkspaceData,
  ): Promise<{
    session: TournamentPlayerSessionRecord
    entry: TournamentWorkspaceRecord | null
  }> {
    const session = await prisma.tournamentPlayerSession.upsert({
      where: { tournamentId_userId: { tournamentId, userId } },
      create: {
        tournamentId,
        userId,
        activeProblemId: data.activeProblemId ?? data.problemId ?? null,
        language: data.language ?? "python",
      },
      update: {
        ...(data.activeProblemId !== undefined ? { activeProblemId: data.activeProblemId } : {}),
        ...(data.language !== undefined ? { language: data.language } : {}),
        ...(data.problemId !== undefined && data.activeProblemId === undefined
          ? { activeProblemId: data.problemId }
          : {}),
      },
    })

    let entry: TournamentWorkspaceRecord | null = null

    if (data.problemId && data.sourceCode !== undefined) {
      const saved = await prisma.tournamentWorkspace.upsert({
        where: {
          tournamentId_userId_problemId: {
            tournamentId,
            userId,
            problemId: data.problemId,
          },
        },
        create: {
          tournamentId,
          userId,
          problemId: data.problemId,
          sourceCode: data.sourceCode,
        },
        update: {
          sourceCode: data.sourceCode,
        },
      })

      entry = toEntry(saved)
    }

    return {
      session: toSession(session),
      entry,
    }
  }
}
