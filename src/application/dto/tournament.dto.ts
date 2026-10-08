import { z } from "zod"

export const tournamentListQuerySchema = z.object({
  search: z.string().optional(),
  type: z.enum(["ffa", "1v1"]).optional(),
  status: z.enum(["Open", "Soon", "Live", "Ended"]).optional(),
})

export type TournamentListQueryDto = z.infer<typeof tournamentListQuerySchema>

const emailListSchema = z
  .array(z.string().email())
  .optional()
  .transform((value) => value ?? [])

export const createTournamentSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().max(2000).optional().default(""),
    type: z.enum(["ffa", "1v1"]).optional().default("ffa"),
    schedule: z.enum(["now", "later"]),
    startsAt: z.string().datetime({ offset: true }).or(z.string().min(1)).optional(),
    visibility: z.enum(["public", "private"]),
    password: z.string().min(1).max(128).optional(),
    startMode: z.enum(["manual", "auto"]),
    maxPlayers: z.coerce.number().int().min(3).max(128),
    durationMinutes: z.coerce.number().int().min(5).max(480).optional().default(60),
    moderatorEmails: emailListSchema,
  })
  .superRefine((data, ctx) => {
    if (data.schedule === "later" && !data.startsAt) {
      ctx.addIssue({
        code: "custom",
        message: "startsAt is required when schedule is later",
        path: ["startsAt"],
      })
    }
  })

export type CreateTournamentDto = z.infer<typeof createTournamentSchema>

export const updateTournamentSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(2000).optional(),
    type: z.enum(["ffa", "1v1"]).optional(),
    schedule: z.enum(["now", "later"]).optional(),
    startsAt: z.string().datetime({ offset: true }).or(z.string().min(1)).optional(),
    visibility: z.enum(["public", "private"]).optional(),
    password: z.string().min(1).max(128).nullable().optional(),
    startMode: z.enum(["manual", "auto"]).optional(),
    maxPlayers: z.coerce.number().int().min(3).max(128).optional(),
    durationMinutes: z.coerce.number().int().min(5).max(480).optional(),
    moderatorEmails: z.array(z.string().email()).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  })

export type UpdateTournamentDto = z.infer<typeof updateTournamentSchema>

export const verifyPasswordSchema = z.object({
  password: z.string().min(1).max(128),
})

export type VerifyPasswordDto = z.infer<typeof verifyPasswordSchema>

export type TournamentModeratorDto = {
  id: string
  displayName: string
  email: string
}

export type TournamentItemDto = {
  id: string
  name: string
  type: "1v1 Match" | "Free For All"
  date: string
  status: "Open" | "Soon" | "Live" | "Ended"
  players: number
  maxPlayers: number
  duration: string
  durationMinutes: number
  description: string
  visibility: "public" | "private"
  startMode: "manual" | "auto"
  host: string
  hostId: string
  passwordProtected?: boolean
  moderators: TournamentModeratorDto[]
  scheduledAt: string
  createdAt: string
  liveStartedAt?: string | null
  pausedAt?: string | null
  resumeAt?: string | null
  pausedTotalMs?: number
  endedAt?: string | null
  viewerRole?: "host" | "player" | "mod" | null
}
