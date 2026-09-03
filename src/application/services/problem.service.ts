import type { IProblemRepository } from "../../domain/repositories/problem.repository.js"
import type { IUserRepository } from "../../domain/repositories/user.repository.js"
import type { CreateProblemDto, ProblemListQueryDto, UpdateProblemDto } from "../dto/problem.dto.js"
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_TARGET_TYPES,
} from "../../domain/entities/activity-log.entity.js"
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../shared/errors/app-error.js"
import { difficultyMap } from "../../infrastructure/database/prisma-problem.repository.js"
import { isUserEmailVerified } from "../../shared/auth/email-verified.js"
import type { ActivityLogService } from "./activity-log.service.js"

export class ProblemService {
  constructor(
    private readonly problemRepository: IProblemRepository,
    private readonly userRepository: IUserRepository,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async listCatalog(query: ProblemListQueryDto) {
    return this.problemRepository.findMany({
      visibility: "PUBLIC",
      search: query.search,
      difficulty: query.difficulty ? difficultyMap[query.difficulty] : undefined,
    })
  }

  async listMine(userId: string) {
    return this.problemRepository.findMany({ authorId: userId })
  }

  async listPendingAdmin() {
    return this.problemRepository.findMany({ visibility: "PENDING" })
  }

  async create(userId: string, emailVerified: boolean, input: CreateProblemDto) {
    await this.requireVerified(userId)
    this.validateTestCases(input.testCases)

    const problem = await this.problemRepository.create({
      authorId: userId,
      title: input.title,
      statement: input.statement,
      difficulty: difficultyMap[input.difficulty ?? "medium"],
      timeLimitMs: input.timeLimitMs,
      memoryLimitMb: input.memoryLimitMb,
      starterPython: input.starterPython,
      starterJs: input.starterJs,
      starterCpp: input.starterCpp,
      testCases: input.testCases.map((test, index) => ({
        input: test.input,
        expectedOutput: test.expectedOutput,
        isSample: test.isSample,
        order: test.order ?? index,
      })),
    })

    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.PROBLEM_CREATED,
      actorId: userId,
      targetType: ACTIVITY_TARGET_TYPES.PROBLEM,
      targetId: problem.id,
      summary: `Problem created: ${problem.title}`,
    })

    return problem
  }

  async getById(id: string, actorId: string, isAdmin: boolean) {
    const problem = await this.problemRepository.findById(id)
    if (!problem) {
      throw new NotFoundError("Problem not found")
    }

    if (problem.visibility === "PUBLIC") {
      return problem
    }

    if (problem.authorId === actorId || isAdmin) {
      return problem
    }

    throw new ForbiddenError("You do not have access to this problem")
  }

  async update(id: string, userId: string, emailVerified: boolean, input: UpdateProblemDto) {
    await this.requireVerified(userId)

    const problem = await this.problemRepository.findById(id)
    if (!problem) {
      throw new NotFoundError("Problem not found")
    }

    if (problem.authorId !== userId) {
      throw new ForbiddenError("Only the author can edit this problem")
    }

    if (problem.visibility !== "PRIVATE") {
      throw new ForbiddenError("Only private problems can be edited")
    }

    if (input.testCases) {
      this.validateTestCases(input.testCases)
    }

    const updated = await this.problemRepository.update(id, {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.statement !== undefined ? { statement: input.statement } : {}),
      ...(input.difficulty !== undefined ? { difficulty: difficultyMap[input.difficulty] } : {}),
      ...(input.timeLimitMs !== undefined ? { timeLimitMs: input.timeLimitMs } : {}),
      ...(input.memoryLimitMb !== undefined ? { memoryLimitMb: input.memoryLimitMb } : {}),
      ...(input.starterPython !== undefined ? { starterPython: input.starterPython } : {}),
      ...(input.starterJs !== undefined ? { starterJs: input.starterJs } : {}),
      ...(input.starterCpp !== undefined ? { starterCpp: input.starterCpp } : {}),
      ...(input.testCases
        ? {
            testCases: input.testCases.map((test, index) => ({
              input: test.input,
              expectedOutput: test.expectedOutput,
              isSample: test.isSample,
              order: test.order ?? index,
            })),
          }
        : {}),
    })

    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.PROBLEM_UPDATED,
      actorId: userId,
      targetType: ACTIVITY_TARGET_TYPES.PROBLEM,
      targetId: id,
      summary: `Problem updated: ${updated.title}`,
    })

    return updated
  }

  async submitForReview(id: string, userId: string, emailVerified: boolean) {
    await this.requireVerified(userId)

    const problem = await this.problemRepository.findById(id)
    if (!problem) {
      throw new NotFoundError("Problem not found")
    }

    if (problem.authorId !== userId) {
      throw new ForbiddenError("Only the author can submit this problem")
    }

    if (problem.visibility !== "PRIVATE") {
      throw new BadRequestError("Only private problems can be submitted for review")
    }

    this.validateTestCases(problem.testCases)

    const updated = await this.problemRepository.updateVisibility(id, "PENDING", { reviewNote: null })
    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.PROBLEM_SUBMITTED_FOR_REVIEW,
      actorId: userId,
      targetType: ACTIVITY_TARGET_TYPES.PROBLEM,
      targetId: id,
      summary: `Problem submitted for review: ${problem.title}`,
    })
    return updated
  }

  async approve(id: string, actorId: string) {
    const problem = await this.problemRepository.findById(id)
    if (!problem) {
      throw new NotFoundError("Problem not found")
    }

    if (problem.visibility !== "PENDING") {
      throw new BadRequestError("Only pending problems can be approved")
    }

    const updated = await this.problemRepository.updateVisibility(id, "PUBLIC", { reviewNote: null })
    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.PROBLEM_APPROVED,
      actorId,
      targetType: ACTIVITY_TARGET_TYPES.PROBLEM,
      targetId: id,
      summary: `Problem approved: ${problem.title}`,
    })
    return updated
  }

  async reject(id: string, actorId: string, reason: string) {
    const problem = await this.problemRepository.findById(id)
    if (!problem) {
      throw new NotFoundError("Problem not found")
    }

    if (problem.visibility !== "PENDING") {
      throw new BadRequestError("Only pending problems can be rejected")
    }

    const updated = await this.problemRepository.updateVisibility(id, "PRIVATE", { reviewNote: reason })
    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.PROBLEM_REJECTED,
      actorId,
      targetType: ACTIVITY_TARGET_TYPES.PROBLEM,
      targetId: id,
      summary: `Problem rejected: ${problem.title}`,
      metadata: { reason },
    })
    return updated
  }

  async unpublish(id: string, actorId: string) {
    const problem = await this.problemRepository.findById(id)
    if (!problem) {
      throw new NotFoundError("Problem not found")
    }

    if (problem.visibility !== "PUBLIC") {
      throw new BadRequestError("Only public problems can be unpublished")
    }

    const updated = await this.problemRepository.updateVisibility(id, "PRIVATE", { reviewNote: null })
    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.PROBLEM_UNPUBLISHED,
      actorId,
      targetType: ACTIVITY_TARGET_TYPES.PROBLEM,
      targetId: id,
      summary: `Problem unpublished: ${problem.title}`,
    })
    return updated
  }

  canAttachToTournament(problem: { authorId: string; visibility: string }, hostId: string) {
    if (problem.visibility === "PUBLIC") return true
    if ((problem.visibility === "PRIVATE" || problem.visibility === "PENDING") && problem.authorId === hostId) {
      return true
    }
    return false
  }

  private async requireVerified(userId: string) {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new BadRequestError("User profile not found. Call /api/auth/bootstrap first.")
    }

    if (!isUserEmailVerified(user)) {
      throw new ForbiddenError("Verified email required")
    }
  }

  private validateTestCases(testCases: { isSample: boolean }[]) {
    const hasSample = testCases.some((t) => t.isSample)
    const hasHidden = testCases.some((t) => !t.isSample)

    if (!hasSample) {
      throw new BadRequestError("At least one sample test case is required")
    }

    if (!hasHidden) {
      throw new BadRequestError("At least one hidden test case is required")
    }
  }
}
