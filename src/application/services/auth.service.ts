import type { AuthClaims } from "../../domain/entities/user.entity.js"
import type { IUserRepository } from "../../domain/repositories/user.repository.js"
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_TARGET_TYPES,
} from "../../domain/entities/activity-log.entity.js"
import { parseAdminEmails, resolveUserRole } from "../../shared/admin/admin-emails.js"
import { resolveEmailVerified } from "../../shared/auth/email-verified.js"
import type { Env } from "../../config/env.js"
import type { ActivityLogService } from "./activity-log.service.js"

export class AuthService {
  private readonly adminEmails: Set<string>

  constructor(
    private readonly userRepository: IUserRepository,
    env: Env,
    private readonly activityLogService: ActivityLogService,
  ) {
    this.adminEmails = parseAdminEmails(env.ADMIN_EMAILS)
  }

  async bootstrapUser(claims: AuthClaims) {
    const role = resolveUserRole(claims.email, this.adminEmails)
    const emailVerified = resolveEmailVerified(claims.emailVerified, claims.emailVerified, role)

    const existing = await this.userRepository.findById(claims.userId)
    const user = await this.userRepository.upsertFromAuth({ ...claims, emailVerified }, role)
    const activeWarn =
      user.status === "SUSPENDED" ? null : await this.userRepository.findLatestWarn(user.id)

    if (!existing) {
      void this.activityLogService.record({
        action: ACTIVITY_ACTIONS.USER_CREATED,
        actorId: user.id,
        targetType: ACTIVITY_TARGET_TYPES.USER,
        targetId: user.id,
        summary: `User account created (${user.email})`,
        metadata: { role: user.role },
      })
    }

    return { user, activeWarn }
  }
}
