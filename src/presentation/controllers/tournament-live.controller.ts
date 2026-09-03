import type { Request, Response } from "express"
import type { TournamentLiveService } from "../../application/services/tournament-live.service.js"
import { RESUME_COUNTDOWN_MS } from "../../application/services/tournament-live.service.js"
import {
  toTournamentItemDto,
  toTournamentLiveStateDto,
} from "../../application/mappers/tournament.mapper.js"
import { BadRequestError, UnauthorizedError } from "../../shared/errors/app-error.js"
import type { TournamentLiveStateNotifier } from "../../shared/realtime/tournament-live-state-notifier.js"
import type { TournamentWithHost } from "../../domain/entities/tournament.entity.js"
import { computeRemainingMs } from "../../shared/tournament/tournament-timer.js"

const resumeFinalizeTimers = new Map<string, NodeJS.Timeout>()
const expiryTimers = new Map<string, NodeJS.Timeout>()

export function clearResumeFinalizeTimer(tournamentId: string) {
  const timer = resumeFinalizeTimers.get(tournamentId)
  if (timer) {
    clearTimeout(timer)
    resumeFinalizeTimers.delete(tournamentId)
  }
}

export function clearTournamentExpiryTimer(tournamentId: string) {
  const timer = expiryTimers.get(tournamentId)
  if (timer) {
    clearTimeout(timer)
    expiryTimers.delete(tournamentId)
  }
}

export class TournamentLiveController {
  constructor(
    private readonly tournamentLiveService: TournamentLiveService,
    private readonly liveStateNotifier: TournamentLiveStateNotifier,
  ) {}

  start = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const tournamentId = this.requireId(req.params.id)

    clearResumeFinalizeTimer(tournamentId)
    clearTournamentExpiryTimer(tournamentId)

    const tournament = await this.tournamentLiveService.start(tournamentId, auth.userId)
    this.liveStateNotifier.notify(toTournamentLiveStateDto(tournament))
    this.scheduleExpiry(tournament)

    res.json(toTournamentItemDto(tournament, "host"))
  }

  pause = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const tournamentId = this.requireId(req.params.id)

    clearResumeFinalizeTimer(tournamentId)
    clearTournamentExpiryTimer(tournamentId)

    const tournament = await this.tournamentLiveService.pause(tournamentId, auth.userId)
    this.liveStateNotifier.notify(toTournamentLiveStateDto(tournament))

    res.json(toTournamentItemDto(tournament, "host"))
  }

  resume = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const tournamentId = this.requireId(req.params.id)

    clearResumeFinalizeTimer(tournamentId)
    clearTournamentExpiryTimer(tournamentId)

    const tournament = await this.tournamentLiveService.resume(tournamentId, auth.userId)
    this.liveStateNotifier.notify(toTournamentLiveStateDto(tournament))

    const timer = setTimeout(() => {
      resumeFinalizeTimers.delete(tournamentId)
      void this.finalizeAndBroadcast(tournamentId)
    }, RESUME_COUNTDOWN_MS)

    resumeFinalizeTimers.set(tournamentId, timer)

    res.json(toTournamentItemDto(tournament, "host"))
  }

  end = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const tournamentId = this.requireId(req.params.id)

    clearResumeFinalizeTimer(tournamentId)
    clearTournamentExpiryTimer(tournamentId)

    const tournament = await this.tournamentLiveService.end(tournamentId, auth.userId)
    this.liveStateNotifier.notify(toTournamentLiveStateDto(tournament))

    res.json(toTournamentItemDto(tournament, "host"))
  }

  scheduleExpiry(tournament: TournamentWithHost) {
    clearTournamentExpiryTimer(tournament.id)

    if (tournament.status !== "LIVE") {
      return
    }

    if (tournament.pausedAt && !tournament.endedAt) {
      return
    }

    const remaining = computeRemainingMs({
      durationMinutes: tournament.durationMinutes,
      liveStartedAt: tournament.liveStartedAt,
      pausedAt: tournament.pausedAt,
      pausedTotalMs: tournament.pausedTotalMs,
      endedAt: tournament.endedAt,
      status: tournament.status,
    })

    if (remaining === null) {
      return
    }

    if (remaining <= 0) {
      void this.expireAndBroadcast(tournament.id)
      return
    }

    const timer = setTimeout(() => {
      expiryTimers.delete(tournament.id)
      void this.expireAndBroadcast(tournament.id)
    }, remaining)

    expiryTimers.set(tournament.id, timer)
  }

  async expireAndBroadcast(tournamentId: string) {
    const tournament = await this.tournamentLiveService.expireByTimer(tournamentId)
    if (!tournament) {
      return
    }

    this.liveStateNotifier.notify(toTournamentLiveStateDto(tournament))

    if (tournament.status === "LIVE" && !tournament.pausedAt) {
      this.scheduleExpiry(tournament)
    }
  }

  async recoverLiveTournaments() {
    const tournaments = await this.tournamentLiveService.listLiveTournaments()

    for (const tournament of tournaments) {
      const finalized = await this.tournamentLiveService.getTournamentMaybeFinalized(tournament.id)
      if (!finalized) {
        continue
      }

      this.liveStateNotifier.notify(toTournamentLiveStateDto(finalized))

      if (finalized.status === "LIVE") {
        this.scheduleExpiry(finalized)
      }
    }
  }

  private async finalizeAndBroadcast(tournamentId: string) {
    const tournament = await this.tournamentLiveService.finalizeResume(tournamentId)
    this.liveStateNotifier.notify(toTournamentLiveStateDto(tournament))

    if (tournament.status === "LIVE" && !tournament.pausedAt) {
      this.scheduleExpiry(tournament)
    }
  }

  private requireAuth(req: Request) {
    if (!req.auth) {
      throw new UnauthorizedError()
    }
    return req.auth
  }

  private requireId(id: string | string[] | undefined): string {
    if (!id || Array.isArray(id)) {
      throw new BadRequestError("Invalid id")
    }
    return id
  }
}
