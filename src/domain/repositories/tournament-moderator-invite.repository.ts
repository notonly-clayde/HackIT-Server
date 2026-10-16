import type {
  PendingModeratorInviteSummary,
  TournamentModeratorInvite,
  TournamentModeratorInviteWithDetails,
} from "../entities/tournament-moderator-invite.entity.js"

export type SyncModeratorInvitesResult = {
  newlyInvitedUserIds: string[]
}

export interface ITournamentModeratorInviteRepository {
  findPendingForUser(userId: string): Promise<PendingModeratorInviteSummary[]>
  findPendingForTournament(tournamentId: string): Promise<TournamentModeratorInviteWithDetails[]>
  findPending(tournamentId: string, userId: string): Promise<TournamentModeratorInvite | null>
  syncForDesiredModerators(
    tournamentId: string,
    hostId: string,
    desiredUserIds: string[],
  ): Promise<SyncModeratorInvitesResult>
  accept(tournamentId: string, userId: string): Promise<void>
  decline(tournamentId: string, userId: string): Promise<void>
}
