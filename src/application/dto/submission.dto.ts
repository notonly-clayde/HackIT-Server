import { z } from "zod"
import type { TournamentStandingsDto } from "./standings.dto.js"

export const submitSolutionSchema = z.object({
  language: z.enum(["javascript", "python", "cpp", "js", "py", "c++"]),
  sourceCode: z.string().min(1).max(50000),
})

export type SubmitSolutionDto = z.infer<typeof submitSolutionSchema>

export type SubmissionResultDto = {
  status: "accepted" | "wrong_answer" | "runtime_error" | "timeout" | "compile_error" | "unsupported"
  cases: {
    index: number
    passed: boolean
    expected?: string
    actual?: string
    error?: string
  }[]
  message?: string
  standings?: TournamentStandingsDto
}

export type RunSolutionDto = SubmitSolutionDto

export type RunSolutionResultDto = SubmissionResultDto
