import type { User, UserRole, UserStatus } from "../../domain/entities/user.entity.js"
import type { IUserRepository } from "../../domain/repositories/user.repository.js"
import type { IReportRepository } from "../../domain/repositories/report.repository.js"
import type { AdminUserListQueryDto } from "../dto/moderation.dto.js"
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_TARGET_TYPES,
} from "../../domain/entities/activity-log.entity.js"
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../shared/errors/app-error.js"
import type { ActivityLogService } from "./activity-log.service.js"

export class AdminUserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly reportRepository: IReportRepository,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async list(query: AdminUserListQueryDto) {
    const status: UserStatus | undefined =
      query.status === "active" ? "ACTIVE" : query.status === "suspended" ? "SUSPENDED" : undefined
    const role: UserRole | undefined =
      query.role === "admin" ? "ADMIN" : query.role === "user" ? "USER" : undefined

    return this.userRepository.findManyAdmin({
      search: query.search,
      status,
      role,
    })
  }

  async getDetail(userId: string) {
    const user = await this.userRepository.findById(userId)
    if (!user) throw new NotFoundError("User not found")

    const [history, reports, activeWarn] = await Promise.all([
      this.userRepository.listModerationActions(userId),
      this.reportRepository.findRecentForTarget("USER", userId),
      this.userRepository.findLatestWarn(userId),
    ])

    return { user, history, reports, activeWarn }
  }

  async warn(actorId: string, subjectId: string, note: string) {
    const subject = await this.requireUser(subjectId)
    if (subject.id === actorId) throw new BadRequestError("You cannot warn yourself")

    await this.userRepository.createModerationAction({
      actorId,
      subjectUserId: subjectId,
      type: "WARN",
      note,
    })

    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.USER_WARNED,
      actorId,
      targetType: ACTIVITY_TARGET_TYPES.USER,
      targetId: subjectId,
      summary: `Warned ${subject.displayName}`,
      metadata: { note },
    })

    return this.getDetail(subjectId)
  }

  async suspend(actorId: string, subjectId: string, reason: string) {
    const subject = await this.requireUser(subjectId)
    if (subject.id === actorId) throw new BadRequestError("You cannot suspend yourself")
    if (subject.status === "SUSPENDED") throw new BadRequestError("User is already suspended")

    await this.userRepository.setSuspended(subjectId, reason)
    await this.userRepository.createModerationAction({
      actorId,
      subjectUserId: subjectId,
      type: "SUSPEND",
      note: reason,
    })

    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.USER_SUSPENDED,
      actorId,
      targetType: ACTIVITY_TARGET_TYPES.USER,
      targetId: subjectId,
      summary: `Suspended ${subject.displayName}`,
      metadata: { reason },
    })

    return this.getDetail(subjectId)
  }

  async unsuspend(actorId: string, subjectId: string) {
    const subject = await this.requireUser(subjectId)
    if (subject.status !== "SUSPENDED") throw new BadRequestError("User is not suspended")

    await this.userRepository.clearSuspended(subjectId)
    await this.userRepository.createModerationAction({
      actorId,
      subjectUserId: subjectId,
      type: "UNSUSPEND",
      note: null,
    })

    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.USER_UNSUSPENDED,
      actorId,
      targetType: ACTIVITY_TARGET_TYPES.USER,
      targetId: subjectId,
      summary: `Unsuspended ${subject.displayName}`,
    })

    return this.getDetail(subjectId)
  }

  async setRole(actorId: string, subjectId: string, role: "user" | "admin") {
    const subject = await this.requireUser(subjectId)
    const nextRole: UserRole = role === "admin" ? "ADMIN" : "USER"

    if (subject.role === nextRole) {
      throw new BadRequestError(`User is already ${role}`)
    }

    if (nextRole === "USER") {
      if (subjectId === actorId) {
        throw new ForbiddenError("You cannot demote yourself")
      }
      const adminCount = await this.userRepository.countAdmins()
      if (adminCount <= 1) {
        throw new ForbiddenError("Cannot demote the last admin")
      }
    }

    await this.userRepository.setRole(subjectId, nextRole)
    await this.userRepository.createModerationAction({
      actorId,
      subjectUserId: subjectId,
      type: nextRole === "ADMIN" ? "PROMOTE" : "DEMOTE",
      note: null,
    })

    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.USER_ROLE_CHANGED,
      actorId,
      targetType: ACTIVITY_TARGET_TYPES.USER,
      targetId: subjectId,
      summary: `${nextRole === "ADMIN" ? "Promoted" : "Demoted"} ${subject.displayName}`,
      metadata: { from: subject.role, to: nextRole },
    })

    return this.getDetail(subjectId)
  }

  private async requireUser(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId)
    if (!user) throw new NotFoundError("User not found")
    return user
  }
}
