import type { ILobbyRepository } from "../../domain/repositories/lobby.repository.js"
import type { IMatchRepository } from "../../domain/repositories/match.repository.js"
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_TARGET_TYPES,
} from "../../domain/entities/activity-log.entity.js"
import { BadRequestError, ForbiddenError, NotFoundError } from "../../shared/errors/app-error.js"
import type { TournamentStandingsNotifier } from "../../shared/realtime/tournament-standings-notifier.js"
import type { ActivityLogService } from "./activity-log.service.js"
import type { StandingsService } from "./standings.service.js"
import { isContestFrozen, type TournamentLiveService } from "./tournament-live.service.js"

export const FOCUS_PENALTY_TOURNAMENT_POINTS = 10
export const FOCUS_PENALTY_VERSUS_ELO = 5
const FOCUS_PENALTY_COOLDOWN_MS = 15_000

export type FocusViolationResult = {
  /** False when the report fell inside the cooldown window and nothing was deducted. */
  applied: boolean
  userId: string
  displayName: string
  deduction: number
  totalDeduction: number
  at: string
}

export type VersusFocusViolationResult = FocusViolationResult & {
  opponentId: string
}

export class IntegrityService {
  private readonly lastPenaltyAt = new Map<string, number>()

  constructor(
    private readonly tournamentLiveService: TournamentLiveService,
    private readonly lobbyRepository: ILobbyRepository,
    private readonly matchRepository: IMatchRepository,
    private readonly standingsService: StandingsService,
    private readonly standingsNotifier: TournamentStandingsNotifier,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async recordTournamentFocusLoss(tournamentId: string, userId: string): Promise<FocusViolationResult> {
    const tournament = await this.tournamentLiveService.getTournamentMaybeFinalized(tournamentId)
    if (!tournament) throw new NotFoundError("Tournament not found")
    if (tournament.status !== "LIVE") throw new BadRequestError("Tournament is not live")

    const player = await this.lobbyRepository.findPlayer(tournamentId, userId)
    if (!player || player.role !== "player" || player.disqualifiedAt) {
      throw new ForbiddenError("Only enrolled players are monitored")
    }

    const at = new Date().toISOString()
    if (isContestFrozen(tournament) || this.inCooldown(`t:${tournamentId}:${userId}`)) {
      return {
        applied: false,
        userId,
        displayName: player.displayName,
        deduction: 0,
        totalDeduction: player.focusPointDeduction,
        at,
      }
    }

    const totalDeduction = await this.lobbyRepository.addFocusPointDeduction(
      tournamentId,
      userId,
      FOCUS_PENALTY_TOURNAMENT_POINTS,
    )

    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.TOURNAMENT_FOCUS_VIOLATION,
      actorId: userId,
      targetType: ACTIVITY_TARGET_TYPES.USER,
      targetId: userId,
      tournamentId,
      summary: `${player.displayName} left the arena tab (-${FOCUS_PENALTY_TOURNAMENT_POINTS} pts)`,
      metadata: {
        userId,
        displayName: player.displayName,
        deduction: FOCUS_PENALTY_TOURNAMENT_POINTS,
        total: totalDeduction,
      },
    })

    const standings = await this.standingsService.getStandings(tournamentId)
    this.standingsNotifier.notify(standings)

    return {
      applied: true,
      userId,
      displayName: player.displayName,
      deduction: FOCUS_PENALTY_TOURNAMENT_POINTS,
      totalDeduction,
      at,
    }
  }

  async recordVersusFocusLoss(matchId: string, userId: string): Promise<VersusFocusViolationResult> {
    const match = await this.matchRepository.findById(matchId)
    if (!match) throw new NotFoundError("Match not found")
    if (match.status !== "LIVE" || !match.playerB) throw new BadRequestError("Match is not live")

    const seat = match.playerAId === userId ? "a" : match.playerBId === userId ? "b" : null
    if (!seat) throw new ForbiddenError("You are not a player in this match")

    const self = seat === "a" ? match.playerA : match.playerB
    const opponentId = seat === "a" ? match.playerB.id : match.playerA.id
    const currentTotal = seat === "a" ? match.playerAFocusEloPenalty : match.playerBFocusEloPenalty
    const at = new Date().toISOString()

    if (this.inCooldown(`v:${matchId}:${userId}`)) {
      return {
        applied: false,
        userId,
        displayName: self.displayName,
        opponentId,
        deduction: 0,
        totalDeduction: currentTotal,
        at,
      }
    }

    const totalDeduction = await this.matchRepository.addFocusEloPenalty(matchId, seat, FOCUS_PENALTY_VERSUS_ELO)
    if (totalDeduction === null) throw new BadRequestError("Match is not live")

    return {
      applied: true,
      userId,
      displayName: self.displayName,
      opponentId,
      deduction: FOCUS_PENALTY_VERSUS_ELO,
      totalDeduction,
      at,
    }
  }

  private inCooldown(key: string): boolean {
    const now = Date.now()
    const last = this.lastPenaltyAt.get(key)
    if (last !== undefined && now - last < FOCUS_PENALTY_COOLDOWN_MS) return true
    this.lastPenaltyAt.set(key, now)
    return false
  }
}
