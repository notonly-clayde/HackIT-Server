import { z } from "zod"

export const bootstrapSchema = z
  .object({
    emailVerified: z.boolean().optional(),
  })
  .default({})

export type BootstrapDto = z.infer<typeof bootstrapSchema>
