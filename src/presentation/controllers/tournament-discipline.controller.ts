import type { Request, Response } from "express"
import type { TournamentDisciplineService } from "../../application/services/tournament-discipline.service.js"
import {
  disciplineDecisionSchema,
  disciplineReasonSchema,
  type TournamentDisciplineDto,
} from "../../application/dto/tournament-discipline.dto.js"
import {
  toTournamentSuspensionRequestDto,
  toTournamentWarningDto,
} from "../../application/mappers/tournament-discipline.mapper.js"
import { BadRequestError, UnauthorizedError } from "../../shared/errors/app-error.js"

export class TournamentDisciplineController {
  constructor(private readonly disciplineService: TournamentDisciplineService) {}

  list = async (req: Request, res: Response) => {
    const userId = this.requireUserId(req)
    const tournamentId = this.requireParam(req.params.id)
    const result = await this.disciplineService.list(tournamentId, userId)
    const body: TournamentDisciplineDto = {
      warnings: result.warnings.map(toTournamentWarningDto),
      suspensionRequests: result.suspensionRequests.map(toTournamentSuspensionRequestDto),
    }
    res.json(body)
  }

  warn = async (req: Request, res: Response) => {
    const userId = this.requireUserId(req)
    const { reason } = this.parseReason(req.body)
    const warning = await this.disciplineService.warn(
      this.requireParam(req.params.id),
      userId,
      this.requireParam(req.params.userId),
      reason,
    )
    res.status(201).json(toTournamentWarningDto(warning))
  }

  requestSuspension = async (req: Request, res: Response) => {
    const userId = this.requireUserId(req)
    const { reason } = this.parseReason(req.body)
    const request = await this.disciplineService.requestSuspension(
      this.requireParam(req.params.id),
      userId,
      this.requireParam(req.params.userId),
      reason,
    )
    res.status(201).json(toTournamentSuspensionRequestDto(request))
  }

  approve = async (req: Request, res: Response) => {
    const userId = this.requireUserId(req)
    const note = this.parseNote(req.body)
    const request = await this.disciplineService.approve(
      this.requireParam(req.params.id),
      userId,
      this.requireParam(req.params.requestId),
      note,
    )
    res.json(toTournamentSuspensionRequestDto(request))
  }

  reject = async (req: Request, res: Response) => {
    const userId = this.requireUserId(req)
    const note = this.parseNote(req.body)
    const request = await this.disciplineService.reject(
      this.requireParam(req.params.id),
      userId,
      this.requireParam(req.params.requestId),
      note,
    )
    res.json(toTournamentSuspensionRequestDto(request))
  }

  disqualify = async (req: Request, res: Response) => {
    const userId = this.requireUserId(req)
    const { reason } = this.parseReason(req.body)
    const request = await this.disciplineService.disqualify(
      this.requireParam(req.params.id),
      userId,
      this.requireParam(req.params.userId),
      reason,
    )
    res.json(toTournamentSuspensionRequestDto(request))
  }

  private parseReason(body: unknown) {
    const parsed = disciplineReasonSchema.safeParse(body)
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid request body")
    }
    return parsed.data
  }

  private parseNote(body: unknown): string | null {
    const parsed = disciplineDecisionSchema.safeParse(body ?? {})
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid request body")
    }
    return parsed.data.note || null
  }

  private requireUserId(req: Request): string {
    if (!req.auth) throw new UnauthorizedError()
    return req.auth.userId
  }

  private requireParam(value: string | string[] | undefined): string {
    if (!value || Array.isArray(value)) throw new BadRequestError("Invalid id")
    return value
  }
}
