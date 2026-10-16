import type { PendingModeratorInviteSummary } from "../../domain/entities/tournament-moderator-invite.entity.js"
import type { TournamentModeratorInviteWithDetails } from "../../domain/entities/tournament-moderator-invite.entity.js"
import type { ModeratorInviteItemDto } from "../dto/tournament-moderator-invite.dto.js"
import type { TournamentItemDtoExtras } from "./tournament.mapper.js"

export function toModeratorInviteItemDto(invite: PendingModeratorInviteSummary): ModeratorInviteItemDto {
  return {
    inviteId: invite.id,
    tournamentId: invite.tournamentId,
    tournamentName: invite.tournamentName,
    hostDisplayName: invite.hostDisplayName,
    invitedAt: invite.invitedAt.toISOString(),
    tournamentStatus: invite.tournamentStatus,
  }
}

export function toHostModeratorInvitesExtras(
  pending: TournamentModeratorInviteWithDetails[],
): TournamentItemDtoExtras {
  return {
    moderatorInvites: pending.map((invite) => ({
      id: invite.userId,
      displayName: invite.inviteeDisplayName,
      email: invite.inviteeEmail,
      status: "pending" as const,
    })),
  }
}
