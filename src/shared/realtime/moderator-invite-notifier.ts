export type ModeratorInviteEventDto = {
  inviteId: string
  tournamentId: string
  tournamentName: string
  hostDisplayName: string
  invitedAt: string
  tournamentStatus: "Open" | "Soon" | "Live" | "Ended"
}

export type ModeratorInviteResolvedEventDto = {
  tournamentId: string
  userId: string
  status: "accepted" | "declined" | "expired"
}

export type ModeratorInviteNotifier = {
  notifyInvite: (userId: string, event: ModeratorInviteEventDto) => void
  notifyResolved: (hostId: string, inviteeUserId: string, event: ModeratorInviteResolvedEventDto) => void
}

export function createModeratorInviteNotifier(): ModeratorInviteNotifier {
  return {
    notifyInvite: () => {},
    notifyResolved: () => {},
  }
}
