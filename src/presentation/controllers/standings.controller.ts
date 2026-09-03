import type { Request, Response } from "express"
import type { StandingsService } from "../../application/services/standings.service.js"
import type { TournamentLiveService } from "../../application/services/tournament-live.service.js"
import { BadRequestError, NotFoundError } from "../../shared/errors/app-error.js"

export class StandingsController {
  constructor(
    private readonly standingsService: StandingsService,
    private readonly tournamentLiveService: TournamentLiveService,
  ) {}

  getByTournamentId = async (req: Request, res: Response) => {
    const id = this.requireId(req.params.id)
    const tournament = await this.tournamentLiveService.getTournamentMaybeFinalized(id)

    if (!tournament) {
      throw new NotFoundError("Tournament not found")
    }

    await this.tournamentLiveService.resolveViewerRole(tournament, req.auth?.userId ?? null)

    const standings = await this.standingsService.getStandings(id)
    res.json(standings)
  }

  private requireId(id: string | string[] | undefined): string {
    if (!id || Array.isArray(id)) {
      throw new BadRequestError("Invalid tournament id")
    }
    return id
  }
}
