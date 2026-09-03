import { z } from "zod"

export const saveMyWorkspaceSchema = z.object({
  problemId: z.string().min(1).optional(),
  sourceCode: z.string().max(50000).optional(),
  activeProblemId: z.string().min(1).nullable().optional(),
  language: z.enum(["python", "javascript", "cpp", "js", "py", "c++"]).optional(),
})

export type SaveMyWorkspaceDto = z.infer<typeof saveMyWorkspaceSchema>

export type TournamentPlayerSessionDto = {
  activeProblemId: string | null
  language: "python" | "javascript" | "cpp"
  updatedAt: string
}

export type TournamentWorkspaceEntryDto = {
  problemId: string
  sourceCode: string
  updatedAt: string
}

export type MyTournamentWorkspaceDto = {
  session: TournamentPlayerSessionDto
  entries: TournamentWorkspaceEntryDto[]
}

export type PlayerWorkspaceViewDto = {
  userId: string
  displayName: string
  session: TournamentPlayerSessionDto
  problemId: string
  sourceCode: string
  updatedAt: string
}

export type TournamentWorkspaceUpdateDto = {
  tournamentId: string
  userId: string
  displayName: string
  activeProblemId: string | null
  language: "python" | "javascript" | "cpp"
  problemId: string
  sourceCode: string
  updatedAt: string
}
