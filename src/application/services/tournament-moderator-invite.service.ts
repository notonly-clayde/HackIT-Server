import type { ITournamentModeratorInviteRepository } from "../../domain/repositories/tournament-moderator-invite.repository.js"
import type { ITournamentRepository } from "../../domain/repositories/tournament.repository.js"
import type { PendingModeratorInviteSummary } from "../../domain/entities/tournament-moderator-invite.entity.js"
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_TARGET_TYPES,
} from "../../domain/entities/activity-log.entity.js"
import { BadRequestError, ForbiddenError, NotFoundError } from "../../shared/errors/app-error.js"
import type { ModeratorInviteNotifier } from "../../shared/realtime/moderator-invite-notifier.js"
import type { ActivityLogService } from "./activity-log.service.js"

const tournamentStatusLabels = {
  OPEN: "Open",
  SOON: "Soon",
  LIVE: "Live",
  ENDED: "Ended",
} as const

export class TournamentModeratorInviteService {
  constructor(
    private readonly inviteRepository: ITournamentModeratorInviteRepository,
    private readonly tournamentRepository: ITournamentRepository,
    private readonly moderatorInviteNotifier: ModeratorInviteNotifier,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async listMine(userId: string): Promise<PendingModeratorInviteSummary[]> {
    return this.inviteRepository.findPendingForUser(userId)
  }

  async syncModerators(tournamentId: string, hostId: string, desiredUserIds: string[]): Promise<void> {
    const { newlyInvitedUserIds } = await this.inviteRepository.syncForDesiredModerators(
      tournamentId,
      hostId,
      desiredUserIds,
    )

    if (newlyInvitedUserIds.length === 0) return

    const tournament = await this.tournamentRepository.findByIdWithHost(tournamentId)
    if (!tournament) return

    for (const inviteeUserId of newlyInvitedUserIds) {
      const pending = await this.inviteRepository.findPending(tournamentId, inviteeUserId)
      if (!pending) continue

      this.moderatorInviteNotifier.notifyInvite(inviteeUserId, {
        inviteId: pending.id,
        tournamentId: tournament.id,
        tournamentName: tournament.name,
        hostDisplayName: tournament.hostDisplayName,
        invitedAt: pending.createdAt.toISOString(),
        tournamentStatus: tournamentStatusLabels[tournament.status],
      })

      void this.activityLogService.record({
        action: ACTIVITY_ACTIONS.TOURNAMENT_MODERATOR_INVITED,
        actorId: hostId,
        targetType: ACTIVITY_TARGET_TYPES.TOURNAMENT,
        targetId: tournamentId,
        tournamentId,
        summary: `Moderator invite sent to user ${inviteeUserId}`,
        metadata: { inviteeUserId },
      })
    }
  }

  async respond(userId: string, tournamentId: string, accept: boolean): Promise<void> {
    const tournament = await this.tournamentRepository.findByIdWithHost(tournamentId)
    if (!tournament) {
      throw new NotFoundError("Tournament not found")
    }

    const invite = await this.inviteRepository.findPending(tournamentId, userId)
    if (!invite) {
      if (!accept) return
      throw new NotFoundError("No pending moderator invite for this tournament")
    }

    if (accept && tournament.status !== "OPEN" && tournament.status !== "SOON") {
      throw new BadRequestError("Moderator invites can only be accepted before the tournament goes live")
    }

    if (accept) {
      await this.inviteRepository.accept(tournamentId, userId)
      void this.activityLogService.record({
        action: ACTIVITY_ACTIONS.TOURNAMENT_MODERATOR_INVITE_ACCEPTED,
        actorId: userId,
        targetType: ACTIVITY_TARGET_TYPES.TOURNAMENT,
        targetId: tournamentId,
        tournamentId,
        summary: "Moderator invite accepted",
      })
    } else {
      await this.inviteRepository.decline(tournamentId, userId)
      void this.activityLogService.record({
        action: ACTIVITY_ACTIONS.TOURNAMENT_MODERATOR_INVITE_DECLINED,
        actorId: userId,
        targetType: ACTIVITY_TARGET_TYPES.TOURNAMENT,
        targetId: tournamentId,
        tournamentId,
        summary: "Moderator invite declined",
      })
    }

    this.moderatorInviteNotifier.notifyResolved(tournament.hostId, userId, {
      tournamentId,
      userId,
      status: accept ? "accepted" : "declined",
    })
  }

  async findPendingForTournament(tournamentId: string, hostId: string) {
    const tournament = await this.tournamentRepository.findByIdWithHost(tournamentId)
    if (!tournament) {
      throw new NotFoundError("Tournament not found")
    }
    if (tournament.hostId !== hostId) {
      throw new ForbiddenError("Only the host can view pending moderator invites")
    }
    return this.inviteRepository.findPendingForTournament(tournamentId)
  }

  async hasPendingInvite(tournamentId: string, userId: string): Promise<boolean> {
    const invite = await this.inviteRepository.findPending(tournamentId, userId)
    return invite !== null
  }
}
