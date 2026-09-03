import type { Request, Response } from "express"
import type { VersusService } from "../../application/services/versus.service.js"
import { submitSolutionSchema } from "../../application/dto/submission.dto.js"
import { BadRequestError, UnauthorizedError } from "../../shared/errors/app-error.js"

export class VersusController {
  constructor(private readonly versusService: VersusService) {}

  getMatch = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const matchId = this.requireId(req.params.id)
    const match = await this.versusService.getMatch(matchId, auth.userId)
    res.json(match)
  }

  run = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const matchId = this.requireId(req.params.id)
    const body = submitSolutionSchema.parse(req.body)
    const result = await this.versusService.run(auth.userId, matchId, body)
    res.json(result)
  }

  submit = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const matchId = this.requireId(req.params.id)
    const body = submitSolutionSchema.parse(req.body)
    const result = await this.versusService.submit(auth.userId, matchId, body)
    res.json(result)
  }

  leave = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const matchId = this.requireId(req.params.id)
    const result = await this.versusService.leave(matchId, auth.userId)
    res.json(result)
  }

  recoverActiveMatches = async () => {
    await this.versusService.recoverActiveMatches()
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
