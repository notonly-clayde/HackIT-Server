import type { TournamentProblemEntry } from "../../domain/entities/problem.entity.js"
import type { ITournamentProblemRepository } from "../../domain/repositories/tournament-problem.repository.js"
import { prisma } from "./prisma.client.js"

const problemInclude = {
  problem: {
    include: {
      author: { select: { displayName: true } },
      testCases: { orderBy: { order: "asc" as const } },
    },
  },
} as const

function toEntry(record: {
  tournamentId: string
  problemId: string
  order: number
  points: number
  problem: {
    id: string
    authorId: string
    title: string
    statement: string
    difficulty: "EASY" | "MEDIUM" | "HARD"
    timeLimitMs: number
    memoryLimitMb: number
    starterPython: string | null
    starterJs: string | null
    starterCpp: string | null
    visibility: "PRIVATE" | "PENDING" | "PUBLIC"
    reviewNote: string | null
    tags: string[]
    seedKey: string | null
    createdAt: Date
    updatedAt: Date
    author: { displayName: string }
    testCases: {
      id: string
      problemId: string
      input: string
      expectedOutput: string
      isSample: boolean
      order: number
    }[]
  }
}): TournamentProblemEntry {
  return {
    tournamentId: record.tournamentId,
    problemId: record.problemId,
    order: record.order,
    points: record.points,
    problem: {
      id: record.problem.id,
      authorId: record.problem.authorId,
      title: record.problem.title,
      statement: record.problem.statement,
      difficulty: record.problem.difficulty,
      timeLimitMs: record.problem.timeLimitMs,
      memoryLimitMb: record.problem.memoryLimitMb,
      starterPython: record.problem.starterPython,
      starterJs: record.problem.starterJs,
      starterCpp: record.problem.starterCpp,
      visibility: record.problem.visibility,
      reviewNote: record.problem.reviewNote,
      tags: record.problem.tags,
      seedKey: record.problem.seedKey,
      createdAt: record.problem.createdAt,
      updatedAt: record.problem.updatedAt,
      authorDisplayName: record.problem.author.displayName,
      testCases: record.problem.testCases.map((test) => ({
        id: test.id,
        problemId: test.problemId,
        input: test.input,
        expectedOutput: test.expectedOutput,
        isSample: test.isSample,
        order: test.order,
      })),
    },
  }
}

async function fetchEntries(tournamentId: string): Promise<TournamentProblemEntry[]> {
  const records = await prisma.tournamentProblem.findMany({
    where: { tournamentId },
    include: problemInclude,
    orderBy: { order: "asc" },
  })

  return records.map(toEntry)
}

export class PrismaTournamentProblemRepository implements ITournamentProblemRepository {
  async findByTournamentId(tournamentId: string): Promise<TournamentProblemEntry[]> {
    return fetchEntries(tournamentId)
  }

  async attach(
    tournamentId: string,
    problemId: string,
    order: number,
    points: number,
  ): Promise<TournamentProblemEntry[]> {
    await prisma.tournamentProblem.create({
      data: { tournamentId, problemId, order, points },
    })

    return fetchEntries(tournamentId)
  }

  async detach(tournamentId: string, problemId: string): Promise<TournamentProblemEntry[]> {
    await prisma.tournamentProblem.delete({
      where: {
        tournamentId_problemId: { tournamentId, problemId },
      },
    })

    return fetchEntries(tournamentId)
  }

  async updateEntry(
    tournamentId: string,
    problemId: string,
    data: { order?: number; points?: number },
  ): Promise<TournamentProblemEntry[]> {
    await prisma.tournamentProblem.update({
      where: {
        tournamentId_problemId: { tournamentId, problemId },
      },
      data: {
        ...(data.order !== undefined ? { order: data.order } : {}),
        ...(data.points !== undefined ? { points: data.points } : {}),
      },
    })

    return fetchEntries(tournamentId)
  }

  async reorder(
    tournamentId: string,
    order: { problemId: string; order: number }[],
  ): Promise<TournamentProblemEntry[]> {
    await prisma.$transaction(
      order.map((item) =>
        prisma.tournamentProblem.update({
          where: {
            tournamentId_problemId: { tournamentId, problemId: item.problemId },
          },
          data: { order: item.order },
        }),
      ),
    )

    return fetchEntries(tournamentId)
  }

  async countHiddenTests(tournamentId: string): Promise<number> {
    return prisma.testCase.count({
      where: {
        isSample: false,
        problem: {
          tournaments: {
            some: { tournamentId },
          },
        },
      },
    })
  }
}
