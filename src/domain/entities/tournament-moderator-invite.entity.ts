export type ModeratorInviteStatus = "PENDING" | "DECLINED"

export type TournamentModeratorInvite = {
  id: string
  tournamentId: string
  userId: string
  invitedById: string
  status: ModeratorInviteStatus
  createdAt: Date
  respondedAt: Date | null
}

export type TournamentModeratorInviteWithDetails = TournamentModeratorInvite & {
  tournamentName: string
  hostDisplayName: string
  scheduledAt: Date
  inviteeDisplayName: string
  inviteeEmail: string
}

export type PendingModeratorInviteSummary = {
  id: string
  tournamentId: string
  tournamentName: string
  hostDisplayName: string
  invitedAt: Date
  tournamentStatus: "Open" | "Soon" | "Live" | "Ended"
}
