import { z } from "zod"
import { PROBLEM_TAG_SLUGS } from "../../shared/problems/tags.js"

const problemTagSchema = z.enum(PROBLEM_TAG_SLUGS)

const tagsSchema = z
  .array(problemTagSchema)
  .min(1)
  .max(5)
  .refine((tags) => new Set(tags).size === tags.length, {
    message: "Tags must be unique",
  })

const testCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  isSample: z.boolean(),
  order: z.coerce.number().int().min(0).optional().default(0),
})

export const problemListQuerySchema = z.object({
  search: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  tag: problemTagSchema.optional(),
})

export type ProblemListQueryDto = z.infer<typeof problemListQuerySchema>

export const createProblemSchema = z.object({
  title: z.string().trim().min(1).max(200),
  statement: z.string().trim().min(1).max(20000),
  difficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
  timeLimitMs: z.coerce.number().int().min(100).max(30000).optional().default(2000),
  memoryLimitMb: z.coerce.number().int().min(16).max(1024).optional().default(256),
  starterPython: z.string().max(10000).nullable().optional(),
  starterJs: z.string().max(10000).nullable().optional(),
  starterCpp: z.string().max(10000).nullable().optional(),
  tags: tagsSchema,
  testCases: z.array(testCaseSchema).min(1),
})

export type CreateProblemDto = z.infer<typeof createProblemSchema>

export const updateProblemSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    statement: z.string().trim().min(1).max(20000).optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
    timeLimitMs: z.coerce.number().int().min(100).max(30000).optional(),
    memoryLimitMb: z.coerce.number().int().min(16).max(1024).optional(),
    starterPython: z.string().max(10000).nullable().optional(),
    starterJs: z.string().max(10000).nullable().optional(),
    starterCpp: z.string().max(10000).nullable().optional(),
    tags: tagsSchema.optional(),
    testCases: z.array(testCaseSchema).min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  })

export type UpdateProblemDto = z.infer<typeof updateProblemSchema>

export const adminProblemListQuerySchema = z.object({
  status: z.enum(["pending"]).optional().default("pending"),
})

export type SampleTestCaseDto = {
  id: string
  input: string
  expectedOutput: string
  order: number
}

export type TestCaseDto = SampleTestCaseDto & {
  isSample: boolean
}

export type ProblemSummaryDto = {
  id: string
  title: string
  difficulty: "easy" | "medium" | "hard"
  visibility: "private" | "pending" | "public"
  authorId: string
  author: string
  timeLimitMs: number
  memoryLimitMb: number
  tags: string[]
  createdAt: string
  reviewNote?: string | null
}

export type ProblemDetailDto = ProblemSummaryDto & {
  statement: string
  starterPython: string | null
  starterJs: string | null
  starterCpp: string | null
  sampleTests: SampleTestCaseDto[]
  hiddenTests?: TestCaseDto[]
}

export const rejectProblemSchema = z.object({
  reason: z.string().trim().min(1).max(1000),
})

export type RejectProblemDto = z.infer<typeof rejectProblemSchema>

export const attachProblemSchema = z
  .object({
    problemId: z.string().min(1).optional(),
    points: z.coerce.number().int().min(1).max(10000).optional().default(100),
    problem: createProblemSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.problemId && !data.problem) {
      ctx.addIssue({
        code: "custom",
        message: "Either problemId or problem is required",
        path: ["problemId"],
      })
    }
  })

export type AttachProblemDto = z.infer<typeof attachProblemSchema>

export const updateTournamentProblemSchema = z.object({
  order: z.coerce.number().int().min(0).optional(),
  points: z.coerce.number().int().min(1).max(10000).optional(),
})

export type UpdateTournamentProblemDto = z.infer<typeof updateTournamentProblemSchema>

export const reorderTournamentProblemsSchema = z.object({
  order: z.array(
    z.object({
      problemId: z.string().min(1),
      order: z.coerce.number().int().min(0),
    }),
  ),
})

export type ReorderTournamentProblemsDto = z.infer<typeof reorderTournamentProblemsSchema>

export type TournamentProblemDto = {
  problemId: string
  order: number
  points: number
  problem: ProblemDetailDto
}
