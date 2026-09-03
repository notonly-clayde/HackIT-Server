import type { Request, Response } from "express"
import type { TournamentProblemService } from "../../application/services/tournament-problem.service.js"
import {
  attachProblemSchema,
  reorderTournamentProblemsSchema,
  updateTournamentProblemSchema,
} from "../../application/dto/problem.dto.js"
import {
  toHostProblemDetailDto,
  toPlayerProblemDetailDto,
} from "../../application/mappers/problem.mapper.js"
import { BadRequestError, UnauthorizedError } from "../../shared/errors/app-error.js"

export class TournamentProblemController {
  constructor(private readonly tournamentProblemService: TournamentProblemService) {}

  list = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const tournamentId = this.requireId(req.params.id)

    const result = await this.tournamentProblemService.listForViewer(tournamentId, auth.userId)
    const mapper = result.isHost ? toHostProblemDetailDto : toPlayerProblemDetailDto

    res.json(
      result.entries.map((entry) => ({
        problemId: entry.problemId,
        order: entry.order,
        points: entry.points,
        problem: mapper(entry.problem),
      })),
    )
  }

  attach = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const tournamentId = this.requireId(req.params.id)
    const parsed = attachProblemSchema.safeParse(req.body)

    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid request body")
    }

    const entries = await this.tournamentProblemService.attach(
      tournamentId,
      auth.userId,
      auth.emailVerified,
      parsed.data,
    )

    res.status(201).json(
      entries.map((entry) => ({
        problemId: entry.problemId,
        order: entry.order,
        points: entry.points,
        problem: toHostProblemDetailDto(entry.problem),
      })),
    )
  }

  update = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const tournamentId = this.requireId(req.params.id)
    const problemId = this.requireId(req.params.problemId)
    const parsed = updateTournamentProblemSchema.safeParse(req.body)

    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid request body")
    }

    const entries = await this.tournamentProblemService.updateEntry(
      tournamentId,
      auth.userId,
      auth.emailVerified,
      problemId,
      parsed.data,
    )

    res.json(
      entries.map((entry) => ({
        problemId: entry.problemId,
        order: entry.order,
        points: entry.points,
        problem: toHostProblemDetailDto(entry.problem),
      })),
    )
  }

  detach = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const tournamentId = this.requireId(req.params.id)
    const problemId = this.requireId(req.params.problemId)

    const entries = await this.tournamentProblemService.detach(
      tournamentId,
      auth.userId,
      auth.emailVerified,
      problemId,
    )

    res.json(
      entries.map((entry) => ({
        problemId: entry.problemId,
        order: entry.order,
        points: entry.points,
        problem: toHostProblemDetailDto(entry.problem),
      })),
    )
  }

  reorder = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const tournamentId = this.requireId(req.params.id)
    const parsed = reorderTournamentProblemsSchema.safeParse(req.body)

    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid request body")
    }

    const entries = await this.tournamentProblemService.reorder(
      tournamentId,
      auth.userId,
      auth.emailVerified,
      parsed.data,
    )

    res.json(
      entries.map((entry) => ({
        problemId: entry.problemId,
        order: entry.order,
        points: entry.points,
        problem: toHostProblemDetailDto(entry.problem),
      })),
    )
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
