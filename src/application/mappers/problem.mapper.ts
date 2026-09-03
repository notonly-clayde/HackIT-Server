import type {
  ProblemDetailDto,
  ProblemSummaryDto,
  SampleTestCaseDto,
  TestCaseDto,
} from "../dto/problem.dto.js"
import type { ProblemWithTests } from "../../domain/entities/problem.entity.js"

const difficultyLabels = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
} as const

const visibilityLabels = {
  PRIVATE: "private",
  PENDING: "pending",
  PUBLIC: "public",
} as const

function toSampleTest(test: ProblemWithTests["testCases"][number]): SampleTestCaseDto {
  return {
    id: test.id,
    input: test.input,
    expectedOutput: test.expectedOutput,
    order: test.order,
  }
}

function toTestCaseDto(test: ProblemWithTests["testCases"][number]): TestCaseDto {
  return {
    ...toSampleTest(test),
    isSample: test.isSample,
  }
}

export function toProblemSummaryDto(
  problem: ProblemWithTests,
  options: { includeReviewNote?: boolean } = {},
): ProblemSummaryDto {
  return {
    id: problem.id,
    title: problem.title,
    difficulty: difficultyLabels[problem.difficulty],
    visibility: visibilityLabels[problem.visibility],
    authorId: problem.authorId,
    author: problem.authorDisplayName,
    timeLimitMs: problem.timeLimitMs,
    memoryLimitMb: problem.memoryLimitMb,
    tags: problem.tags,
    createdAt: problem.createdAt.toISOString(),
    ...(options.includeReviewNote ? { reviewNote: problem.reviewNote } : {}),
  }
}

export function toProblemDetailDto(
  problem: ProblemWithTests,
  options: { includeHiddenTests?: boolean; includeReviewNote?: boolean } = {},
): ProblemDetailDto {
  const sampleTests = problem.testCases.filter((t) => t.isSample).map(toSampleTest)

  return {
    ...toProblemSummaryDto(problem, { includeReviewNote: options.includeReviewNote }),
    statement: problem.statement,
    starterPython: problem.starterPython,
    starterJs: problem.starterJs,
    starterCpp: problem.starterCpp,
    sampleTests,
    ...(options.includeHiddenTests
      ? { hiddenTests: problem.testCases.filter((t) => !t.isSample).map(toTestCaseDto) }
      : {}),
  }
}

export function toPlayerProblemDetailDto(problem: ProblemWithTests): ProblemDetailDto {
  return toProblemDetailDto(problem, { includeHiddenTests: false, includeReviewNote: false })
}

export function toHostProblemDetailDto(problem: ProblemWithTests): ProblemDetailDto {
  return toProblemDetailDto(problem, { includeHiddenTests: true, includeReviewNote: true })
}
