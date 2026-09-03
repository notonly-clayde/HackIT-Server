import type { Prisma } from "@prisma/client"
import type {
  CreateProblemData,
  ProblemDifficulty,
  ProblemFilters,
  ProblemVisibility,
  ProblemWithTests,
  UpdateProblemData,
} from "../../domain/entities/problem.entity.js"
import type { IProblemRepository } from "../../domain/repositories/problem.repository.js"
import { prisma } from "./prisma.client.js"

const difficultyMap: Record<string, ProblemDifficulty> = {
  easy: "EASY",
  medium: "MEDIUM",
  hard: "HARD",
}

const authorInclude = {
  author: { select: { displayName: true } },
  testCases: { orderBy: { order: "asc" as const } },
} as const

type ProblemRecord = Prisma.ProblemGetPayload<{
  include: typeof authorInclude
}>

function toProblemWithTests(record: ProblemRecord): ProblemWithTests {
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

function buildWhere(filters: ProblemFilters): Prisma.ProblemWhereInput {
  const where: Prisma.ProblemWhereInput = {}

  if (filters.visibility) {
    where.visibility = filters.visibility
  }

  if (filters.authorId) {
    where.authorId = filters.authorId
  }

  if (filters.difficulty) {
    where.difficulty = filters.difficulty
  }

  if (filters.search?.trim()) {
    where.title = { contains: filters.search.trim(), mode: "insensitive" }
  }

  return where
}

export class PrismaProblemRepository implements IProblemRepository {
  async findMany(filters: ProblemFilters): Promise<ProblemWithTests[]> {
    const records = await prisma.problem.findMany({
      where: buildWhere(filters),
      include: authorInclude,
      orderBy: [{ updatedAt: "desc" }],
    })

    return records.map(toProblemWithTests)
  }

  async findById(id: string): Promise<ProblemWithTests | null> {
    const record = await prisma.problem.findUnique({
      where: { id },
      include: authorInclude,
    })

    return record ? toProblemWithTests(record) : null
  }

  async create(data: CreateProblemData): Promise<ProblemWithTests> {
    const record = await prisma.problem.create({
      data: {
        authorId: data.authorId,
        title: data.title,
        statement: data.statement,
        difficulty: data.difficulty,
        timeLimitMs: data.timeLimitMs,
        memoryLimitMb: data.memoryLimitMb,
        starterPython: data.starterPython ?? null,
        starterJs: data.starterJs ?? null,
        starterCpp: data.starterCpp ?? null,
        visibility: "PRIVATE",
        testCases: {
          create: data.testCases.map((test, index) => ({
            input: test.input,
            expectedOutput: test.expectedOutput,
            isSample: test.isSample,
            order: test.order ?? index,
          })),
        },
      },
      include: authorInclude,
    })

    return toProblemWithTests(record)
  }

  async update(id: string, data: UpdateProblemData): Promise<ProblemWithTests> {
    const record = await prisma.$transaction(async (tx) => {
      if (data.testCases) {
        await tx.testCase.deleteMany({ where: { problemId: id } })
      }

      return tx.problem.update({
        where: { id },
        data: {
          ...(data.title !== undefined ? { title: data.title } : {}),
          ...(data.statement !== undefined ? { statement: data.statement } : {}),
          ...(data.difficulty !== undefined ? { difficulty: data.difficulty } : {}),
          ...(data.timeLimitMs !== undefined ? { timeLimitMs: data.timeLimitMs } : {}),
          ...(data.memoryLimitMb !== undefined ? { memoryLimitMb: data.memoryLimitMb } : {}),
          ...(data.starterPython !== undefined ? { starterPython: data.starterPython } : {}),
          ...(data.starterJs !== undefined ? { starterJs: data.starterJs } : {}),
          ...(data.starterCpp !== undefined ? { starterCpp: data.starterCpp } : {}),
          ...(data.testCases
            ? {
                testCases: {
                  create: data.testCases.map((test, index) => ({
                    input: test.input,
                    expectedOutput: test.expectedOutput,
                    isSample: test.isSample,
                    order: test.order ?? index,
                  })),
                },
              }
            : {}),
        },
        include: authorInclude,
      })
    })

    return toProblemWithTests(record)
  }

  async updateVisibility(
    id: string,
    visibility: ProblemVisibility,
    options?: { reviewNote?: string | null },
  ): Promise<ProblemWithTests> {
    const record = await prisma.problem.update({
      where: { id },
      data: {
        visibility,
        ...(options && "reviewNote" in options ? { reviewNote: options.reviewNote ?? null } : {}),
      },
      include: authorInclude,
    })

    return toProblemWithTests(record)
  }
}

export { difficultyMap }
