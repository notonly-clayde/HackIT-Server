export type ProblemDifficulty = "EASY" | "MEDIUM" | "HARD"
export type ProblemVisibility = "PRIVATE" | "PENDING" | "PUBLIC"

export type TestCase = {
  id: string
  problemId: string
  input: string
  expectedOutput: string
  isSample: boolean
  order: number
}

export type Problem = {
  id: string
  authorId: string
  title: string
  statement: string
  difficulty: ProblemDifficulty
  timeLimitMs: number
  memoryLimitMb: number
  starterPython: string | null
  starterJs: string | null
  starterCpp: string | null
  visibility: ProblemVisibility
  reviewNote: string | null
  createdAt: Date
  updatedAt: Date
}

export type ProblemWithAuthor = Problem & {
  authorDisplayName: string
}

export type ProblemWithTests = ProblemWithAuthor & {
  testCases: TestCase[]
}

export type ProblemFilters = {
  search?: string
  difficulty?: ProblemDifficulty
  visibility?: ProblemVisibility
  authorId?: string
}

export type CreateProblemData = {
  authorId: string
  title: string
  statement: string
  difficulty: ProblemDifficulty
  timeLimitMs: number
  memoryLimitMb: number
  starterPython?: string | null
  starterJs?: string | null
  starterCpp?: string | null
  testCases: {
    input: string
    expectedOutput: string
    isSample: boolean
    order: number
  }[]
}

export type UpdateProblemData = {
  title?: string
  statement?: string
  difficulty?: ProblemDifficulty
  timeLimitMs?: number
  memoryLimitMb?: number
  starterPython?: string | null
  starterJs?: string | null
  starterCpp?: string | null
  testCases?: {
    input: string
    expectedOutput: string
    isSample: boolean
    order: number
  }[]
}

export type TournamentProblemEntry = {
  tournamentId: string
  problemId: string
  order: number
  points: number
  problem: ProblemWithTests
}
