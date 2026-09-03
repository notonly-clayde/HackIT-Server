import type { Request, Response } from "express"
import type { ProblemService } from "../../application/services/problem.service.js"
import type { IUserRepository } from "../../domain/repositories/user.repository.js"
import {
  createProblemSchema,
  problemListQuerySchema,
  rejectProblemSchema,
  updateProblemSchema,
} from "../../application/dto/problem.dto.js"
import {
  toHostProblemDetailDto,
  toPlayerProblemDetailDto,
  toProblemSummaryDto,
} from "../../application/mappers/problem.mapper.js"
import { BadRequestError, UnauthorizedError } from "../../shared/errors/app-error.js"

export class ProblemController {
  constructor(
    private readonly problemService: ProblemService,
    private readonly userRepository: IUserRepository,
  ) {}

  listCatalog = async (req: Request, res: Response) => {
    const parsed = problemListQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid query parameters")
    }

    const problems = await this.problemService.listCatalog(parsed.data)
    res.json(problems.map((p) => toPlayerProblemDetailDto(p)))
  }

  listMine = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const problems = await this.problemService.listMine(auth.userId)
    res.json(problems.map((p) => toHostProblemDetailDto(p)))
  }

  create = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const parsed = createProblemSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid request body")
    }

    const problem = await this.problemService.create(auth.userId, auth.emailVerified, parsed.data)
    res.status(201).json(toHostProblemDetailDto(problem))
  }

  getById = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const id = this.requireId(req.params.id)
    const isAdmin = await this.isAdmin(auth.userId)

    const problem = await this.problemService.getById(id, auth.userId, isAdmin)
    const includeHidden =
      problem.authorId === auth.userId || isAdmin || problem.visibility !== "PUBLIC"

    res.json(includeHidden ? toHostProblemDetailDto(problem) : toPlayerProblemDetailDto(problem))
  }

  update = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const id = this.requireId(req.params.id)
    const parsed = updateProblemSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid request body")
    }

    const problem = await this.problemService.update(id, auth.userId, auth.emailVerified, parsed.data)
    res.json(toHostProblemDetailDto(problem))
  }

  submitForReview = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const id = this.requireId(req.params.id)

    const problem = await this.problemService.submitForReview(id, auth.userId, auth.emailVerified)
    res.json(toHostProblemDetailDto(problem))
  }

  listPendingAdmin = async (_req: Request, res: Response) => {
    const problems = await this.problemService.listPendingAdmin()
    res.json(problems.map((p) => toHostProblemDetailDto(p)))
  }

  approve = async (req: Request, res: Response) => {
    const id = this.requireId(req.params.id)
    const problem = await this.problemService.approve(id, req.auth!.userId)
    res.json(toProblemSummaryDto(problem, { includeReviewNote: true }))
  }

  reject = async (req: Request, res: Response) => {
    const id = this.requireId(req.params.id)
    const parsed = rejectProblemSchema.safeParse(req.body ?? {})
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Rejection reason is required")
    }

    const problem = await this.problemService.reject(id, req.auth!.userId, parsed.data.reason)
    res.json(toProblemSummaryDto(problem, { includeReviewNote: true }))
  }

  unpublish = async (req: Request, res: Response) => {
    const id = this.requireId(req.params.id)
    const problem = await this.problemService.unpublish(id, req.auth!.userId)
    res.json(toProblemSummaryDto(problem, { includeReviewNote: true }))
  }

  private requireAuth(req: Request) {
    if (!req.auth) {
      throw new UnauthorizedError()
    }
    return req.auth
  }

  private requireId(id: string | string[] | undefined): string {
    if (!id || Array.isArray(id)) {
      throw new BadRequestError("Invalid problem id")
    }
    return id
  }

  private async isAdmin(userId: string) {
    const user = await this.userRepository.findById(userId)
    return user?.role === "ADMIN"
  }
}
