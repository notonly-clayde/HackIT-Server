import type { Request, Response } from "express"
import type { SubmissionService } from "../../application/services/submission.service.js"
import type { IUserRepository } from "../../domain/repositories/user.repository.js"
import { submitSolutionSchema } from "../../application/dto/submission.dto.js"
import { BadRequestError, UnauthorizedError } from "../../shared/errors/app-error.js"

export class SubmissionController {
  constructor(
    private readonly submissionService: SubmissionService,
    private readonly userRepository: IUserRepository,
  ) {}

  runPractice = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const problemId = this.requireId(req.params.id)
    const body = submitSolutionSchema.parse(req.body)
    const isAdmin = await this.isAdmin(auth.userId)
    const result = await this.submissionService.runPractice(auth.userId, problemId, body, isAdmin)
    res.json(result)
  }

  submitPractice = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const problemId = this.requireId(req.params.id)
    const body = submitSolutionSchema.parse(req.body)
    const isAdmin = await this.isAdmin(auth.userId)
    const result = await this.submissionService.submitPractice(auth.userId, problemId, body, isAdmin)
    res.json(result)
  }

  runTournament = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const tournamentId = this.requireId(req.params.id)
    const problemId = this.requireId(req.params.problemId)
    const body = submitSolutionSchema.parse(req.body)
    const result = await this.submissionService.runTournament(
      auth.userId,
      tournamentId,
      problemId,
      body,
    )
    res.json(result)
  }

  submitTournament = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const tournamentId = this.requireId(req.params.id)
    const problemId = this.requireId(req.params.problemId)
    const body = submitSolutionSchema.parse(req.body)
    const result = await this.submissionService.submitTournament(
      auth.userId,
      tournamentId,
      problemId,
      body,
    )
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
      throw new BadRequestError("Invalid id")
    }
    return id
  }

  private async isAdmin(userId: string) {
    const user = await this.userRepository.findById(userId)
    return user?.role === "ADMIN"
  }
}
