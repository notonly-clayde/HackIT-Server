import type { Prisma } from "@prisma/client"
import type {
  CreateMatchData,
  CreateMatchSubmissionData,
  MatchHistoryRecord,
  MatchStatus,
  MatchSubmissionRecord,
  MatchWithPlayers,
  SubmissionVerdict,
} from "../../domain/entities/match.entity.js"
import type { ProblemWithTests } from "../../domain/entities/problem.entity.js"
import type { User } from "../../domain/entities/user.entity.js"
import type { IMatchRepository, SettleMatchData } from "../../domain/repositories/match.repository.js"
import { prisma } from "./prisma.client.js"

const matchInclude = {
  playerA: true,
  playerB: true,
  problem: {
    include: {
      author: { select: { displayName: true } },
      testCases: { orderBy: { order: "asc" as const } },
    },
  },
} as const

type MatchRecord = Prisma.MatchGetPayload<{ include: typeof matchInclude }>

function toUser(record: MatchRecord["playerA"]): User {
  return {
    id: record.id,
    email: record.email,
    name: record.name,
    displayName: record.displayName,
    avatarUrl: record.avatarUrl,
    bio: record.bio,
    emailVerified: record.emailVerified,
    role: record.role,
    status: record.status,
    suspendedAt: record.suspendedAt,
    suspendReason: record.suspendReason,
    elo1v1: record.elo1v1,
    eloTournament: record.eloTournament,
    peakElo1v1: record.peakElo1v1,
    winStreak1v1: record.winStreak1v1,
    wins: record.wins,
    draws: record.draws,
    matchCount: record.matchCount,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    lastSyncedAt: record.lastSyncedAt,
  }
}

function toProblem(record: MatchRecord["problem"]): ProblemWithTests {
  return {
    id: record.id,
    authorId: record.authorId,
    title: record.title,
    statement: record.statement,
    difficulty: record.difficulty,
    timeLimitMs: record.timeLimitMs,
    memoryLimitMb: record.memoryLimitMb,
    starterPython: record.starterPython,
    starterJs: record.starterJs,
    starterCpp: record.starterCpp,
    visibility: record.visibility,
    reviewNote: record.reviewNote,
    tags: record.tags,
    seedKey: record.seedKey,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    authorDisplayName: record.author.displayName,
    testCases: record.testCases.map((test) => ({
      id: test.id,
      problemId: test.problemId,
      input: test.input,
      expectedOutput: test.expectedOutput,
      isSample: test.isSample,
      order: test.order,
    })),
  }
}

function toMatch(record: MatchRecord): MatchWithPlayers {
  return {
    id: record.id,
    playerAId: record.playerAId,
    playerBId: record.playerBId,
    problemId: record.problemId,
    difficulty: record.difficulty,
    status: record.status,
    durationMinutes: record.durationMinutes,
    lobbyEndsAt: record.lobbyEndsAt,
    startedAt: record.startedAt,
    endedAt: record.endedAt,
    winnerId: record.winnerId,
    playerAEloBefore: record.playerAEloBefore,
    playerBEloBefore: record.playerBEloBefore,
    playerAEloAfter: record.playerAEloAfter,
    playerBEloAfter: record.playerBEloAfter,
    endedReason: record.endedReason,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    playerA: toUser(record.playerA),
    playerB: toUser(record.playerB),
    problem: toProblem(record.problem),
  }
}

export class PrismaMatchRepository implements IMatchRepository {
  async create(data: CreateMatchData): Promise<MatchWithPlayers> {
    const record = await prisma.match.create({
      data: {
        playerAId: data.playerAId,
        playerBId: data.playerBId,
        problemId: data.problemId,
        difficulty: data.difficulty,
        durationMinutes: data.durationMinutes,
        lobbyEndsAt: data.lobbyEndsAt,
        playerAEloBefore: data.playerAEloBefore,
        playerBEloBefore: data.playerBEloBefore,
        status: "LOBBY",
      },
      include: matchInclude,
    })

    return toMatch(record)
  }

  async findById(id: string): Promise<MatchWithPlayers | null> {
    const record = await prisma.match.findUnique({
      where: { id },
      include: matchInclude,
    })
    return record ? toMatch(record) : null
  }

  async findByStatus(status: MatchStatus): Promise<MatchWithPlayers[]> {
    const records = await prisma.match.findMany({
      where: { status },
      include: matchInclude,
      orderBy: { createdAt: "asc" },
    })
    return records.map(toMatch)
  }

  async startLive(id: string, startedAt: Date): Promise<MatchWithPlayers | null> {
    const updated = await prisma.match.updateMany({
      where: { id, status: "LOBBY" },
      data: { status: "LIVE", startedAt },
    })
    if (updated.count === 0) return null
    return this.findById(id)
  }

  async settle(
    id: string,
    fromStatuses: MatchStatus[],
    data: SettleMatchData,
  ): Promise<MatchWithPlayers | null> {
    const updated = await prisma.match.updateMany({
      where: { id, status: { in: fromStatuses } },
      data: {
        status: data.status ?? "ENDED",
        endedAt: data.endedAt,
        winnerId: data.winnerId,
        playerAEloAfter: data.playerAEloAfter,
        playerBEloAfter: data.playerBEloAfter,
        endedReason: data.endedReason ?? null,
      },
    })
    if (updated.count === 0) return null
    return this.findById(id)
  }

  async createSubmission(data: CreateMatchSubmissionData): Promise<MatchSubmissionRecord> {
    const record = await prisma.matchSubmission.create({
      data: {
        matchId: data.matchId,
        userId: data.userId,
        problemId: data.problemId,
        language: data.language,
        sourceCode: data.sourceCode,
        verdict: data.verdict as SubmissionVerdict,
        effectiveElapsedMinutes: data.effectiveElapsedMinutes,
      },
    })

    return {
      id: record.id,
      matchId: record.matchId,
      userId: record.userId,
      problemId: record.problemId,
      language: record.language,
      sourceCode: record.sourceCode,
      verdict: record.verdict,
      effectiveElapsedMinutes: record.effectiveElapsedMinutes,
      submittedAt: record.submittedAt,
    }
  }

  async hasAccepted(matchId: string): Promise<boolean> {
    const count = await prisma.matchSubmission.count({
      where: { matchId, verdict: "ACCEPTED" },
    })
    return count > 0
  }

  async findLatestSubmissions(matchId: string): Promise<MatchSubmissionRecord[]> {
    const records = await prisma.matchSubmission.findMany({
      where: { matchId },
      orderBy: { submittedAt: "desc" },
    })

    const latestByUser = new Map<string, MatchSubmissionRecord>()
    const acceptedByUser = new Map<string, MatchSubmissionRecord>()
    for (const record of records) {
      const mapped: MatchSubmissionRecord = {
        id: record.id,
        matchId: record.matchId,
        userId: record.userId,
        problemId: record.problemId,
        language: record.language,
        sourceCode: record.sourceCode,
        verdict: record.verdict,
        effectiveElapsedMinutes: record.effectiveElapsedMinutes,
        submittedAt: record.submittedAt,
      }
      if (!latestByUser.has(record.userId)) latestByUser.set(record.userId, mapped)
      if (record.verdict === "ACCEPTED" && !acceptedByUser.has(record.userId)) {
        acceptedByUser.set(record.userId, mapped)
      }
    }

    return [...latestByUser.keys()].map((userId) => acceptedByUser.get(userId) ?? latestByUser.get(userId)!)
  }

  async findRecentEndedByUserId(userId: string, limit: number): Promise<MatchHistoryRecord[]> {
    const records = await prisma.match.findMany({
      where: {
        status: "ENDED",
        OR: [{ playerAId: userId }, { playerBId: userId }],
      },
      orderBy: { endedAt: "desc" },
      take: limit,
      select: {
        id: true,
        difficulty: true,
        endedAt: true,
        winnerId: true,
        playerAId: true,
        playerBId: true,
        playerAEloBefore: true,
        playerBEloBefore: true,
        playerAEloAfter: true,
        playerBEloAfter: true,
        endedReason: true,
        playerA: { select: { id: true, displayName: true, avatarUrl: true } },
        playerB: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    })

    return records
  }
}
