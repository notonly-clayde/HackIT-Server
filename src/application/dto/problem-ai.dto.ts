import { z } from "zod"
import { createProblemSchema } from "./problem.dto.js"

export const generateProblemDraftSchema = z.object({
  prompt: z.string().trim().min(1).max(500),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  inputMode: z.enum(["lines", "json"]).optional().default("lines"),
})

export type GenerateProblemDraftDto = z.infer<typeof generateProblemDraftSchema>

export type GeneratedProblemDraftDto = z.infer<typeof createProblemSchema>
