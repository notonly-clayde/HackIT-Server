import type { Request, Response } from "express"
import type { TournamentService } from "../../application/services/tournament.service.js"
import type { TournamentLiveService } from "../../application/services/tournament-live.service.js"
import {
  createTournamentSchema,
  tournamentListQuerySchema,
  updateTournamentSchema,
  verifyPasswordSchema,
} from "../../application/dto/tournament.dto.js"
import { toTournamentItemDto } from "../../application/mappers/tournament.mapper.js"
import type { TournamentCatalogNotifier } from "../../shared/realtime/tournament-catalog-notifier.js"
import { BadRequestError, NotFoundError, UnauthorizedError } from "../../shared/errors/app-error.js"

export class TournamentController {
  constructor(
    private readonly tournamentService: TournamentService,
    private readonly tournamentLiveService: TournamentLiveService,
    private readonly tournamentCatalogNotifier: TournamentCatalogNotifier,
  ) {}

  list = async (req: Request, res: Response) => {
    const parsed = tournamentListQuerySchema.safeParse(req.query)

    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid query parameters")
    }

    const tournaments = await this.tournamentService.list(parsed.data)
    res.json(tournaments.map((t) => toTournamentItemDto(t)))
  }

  getById = async (req: Request, res: Response) => {
    const id = this.requireId(req.params.id)
    const tournament = await this.tournamentLiveService.getTournamentMaybeFinalized(id)

    if (!tournament) {
      throw new NotFoundError("Tournament not found")
    }

    const viewerRole = await this.tournamentLiveService.resolveViewerRole(
      tournament,
      req.auth?.userId ?? null,
    )
    res.json(toTournamentItemDto(tournament, viewerRole))
  }

  create = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const parsed = createTournamentSchema.safeParse(req.body)

    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid request body")
    }

    const tournament = await this.tournamentService.create(auth.userId, auth.emailVerified, parsed.data)
    const dto = toTournamentItemDto(tournament)
    this.tournamentCatalogNotifier.notify({ action: "created", tournament: dto })
    res.status(201).json(dto)
  }

  update = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const id = this.requireId(req.params.id)
    const parsed = updateTournamentSchema.safeParse(req.body)

    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid request body")
    }

    const tournament = await this.tournamentService.update(id, auth.userId, auth.emailVerified, parsed.data)
    const dto = toTournamentItemDto(tournament)
    this.tournamentCatalogNotifier.notify({ action: "updated", tournament: dto })
    res.json(dto)
  }

  remove = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const id = this.requireId(req.params.id)

    await this.tournamentService.delete(id, auth.userId, auth.emailVerified)
    this.tournamentCatalogNotifier.notify({ action: "removed", tournamentId: id })
    res.status(204).send()
  }

  verifyPassword = async (req: Request, res: Response) => {
    this.requireAuth(req)
    const id = this.requireId(req.params.id)
    const parsed = verifyPasswordSchema.safeParse(req.body)

    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid request body")
    }

    const result = await this.tournamentService.verifyPassword(id, parsed.data.password)
    res.json(result)
  }

  private requireAuth(req: Request) {
    if (!req.auth) {
      throw new UnauthorizedError()
    }
    return req.auth
  }

  private requireId(id: string | string[] | undefined): string {
    if (!id || Array.isArray(id)) {
      throw new BadRequestError("Invalid tournament id")
    }
    return id
  }
}
