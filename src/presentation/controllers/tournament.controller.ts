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
import type { TournamentModeratorInviteService } from "../../application/services/tournament-moderator-invite.service.js"
import type { TournamentWithHost } from "../../domain/entities/tournament.entity.js"
import { respondModeratorInviteSchema } from "../../application/dto/tournament-moderator-invite.dto.js"
import {
  toHostModeratorInvitesExtras,
  toModeratorInviteItemDto,
} from "../../application/mappers/tournament-moderator-invite.mapper.js"
import type { TournamentItemDtoExtras } from "../../application/mappers/tournament.mapper.js"

export class TournamentController {
  constructor(
    private readonly tournamentService: TournamentService,
    private readonly tournamentLiveService: TournamentLiveService,
    private readonly tournamentCatalogNotifier: TournamentCatalogNotifier,
    private readonly moderatorInviteService: TournamentModeratorInviteService,
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

    const viewerId = req.auth?.userId ?? null
    const viewerRole = await this.tournamentLiveService.resolveViewerRole(tournament, viewerId)
    const extras = await this.buildViewerExtras(tournament, viewerId)
    const dto = toTournamentItemDto(tournament, viewerRole, extras)

    if (viewerRole === "player" && viewerId) {
      const disqualification = await this.tournamentLiveService.findDisqualification(tournament.id, viewerId)
      if (disqualification) {
        dto.viewerDisqualified = true
        dto.viewerDisqualifyReason = disqualification.reason
      }

      const scoreAccepted = await this.tournamentLiveService.findScoreAccepted(tournament.id, viewerId)
      if (scoreAccepted) {
        dto.viewerContestFinished = true
      }
    }

    res.json(dto)
  }

  create = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const parsed = createTournamentSchema.safeParse(req.body)

    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid request body")
    }

    const tournament = await this.tournamentService.create(auth.userId, auth.emailVerified, parsed.data)
    const extras = await this.buildViewerExtras(tournament, auth.userId)
    const dto = toTournamentItemDto(tournament, "host", extras)
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
    const viewerRole = await this.tournamentLiveService.resolveViewerRole(tournament, auth.userId)
    const extras = await this.buildViewerExtras(tournament, auth.userId)
    const dto = toTournamentItemDto(tournament, viewerRole, extras)
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

  listModeratorInvites = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const invites = await this.moderatorInviteService.listMine(auth.userId)
    res.json(invites.map(toModeratorInviteItemDto))
  }

  respondModeratorInvite = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const id = this.requireId(req.params.id)
    const parsed = respondModeratorInviteSchema.safeParse(req.body)

    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid request body")
    }

    await this.moderatorInviteService.respond(auth.userId, id, parsed.data.accept)
    res.json({ ok: true as const })
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

  private async buildViewerExtras(
    tournament: TournamentWithHost,
    viewerId: string | null,
  ): Promise<TournamentItemDtoExtras | undefined> {
    if (!viewerId) return undefined

    const extras: TournamentItemDtoExtras = {}

    if (tournament.hostId === viewerId) {
      const pending = await this.moderatorInviteService.findPendingForTournament(tournament.id, viewerId)
      Object.assign(extras, toHostModeratorInvitesExtras(pending))
    }

    if (await this.moderatorInviteService.hasPendingInvite(tournament.id, viewerId)) {
      extras.viewerModeratorInvitePending = true
    }

    return Object.keys(extras).length > 0 ? extras : undefined
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
