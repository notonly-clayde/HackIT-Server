import { z } from "zod"

export type ModeratorInviteItemDto = {
  inviteId: string
  tournamentId: string
  tournamentName: string
  hostDisplayName: string
  invitedAt: string
  tournamentStatus: "Open" | "Soon" | "Live" | "Ended"
}

export type TournamentModeratorInviteDto = {
  id: string
  displayName: string
  email: string
  status: "pending"
}

export const respondModeratorInviteSchema = z.object({
  accept: z.boolean(),
})

export type RespondModeratorInviteDto = z.infer<typeof respondModeratorInviteSchema>
