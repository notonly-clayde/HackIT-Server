import type { UpdateUserProfileInput, User } from "../../domain/entities/user.entity.js"
import type { IUserRepository } from "../../domain/repositories/user.repository.js"
import type { IMatchRepository } from "../../domain/repositories/match.repository.js"
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_TARGET_TYPES,
} from "../../domain/entities/activity-log.entity.js"
import { NotFoundError } from "../../shared/errors/app-error.js"
import type { ActivityLogService } from "./activity-log.service.js"
import { toMatchHistoryItemDto } from "../mappers/versus.mapper.js"
import type { MatchHistoryItemDto } from "../dto/user.dto.js"

const DEFAULT_MATCH_HISTORY_LIMIT = 20
const MAX_MATCH_HISTORY_LIMIT = 50

export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly activityLogService: ActivityLogService,
    private readonly matchRepository: IMatchRepository,
  ) {}

  async getMe(userId: string): Promise<{ user: User; activeWarn: Awaited<ReturnType<IUserRepository["findLatestWarn"]>> }> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new NotFoundError("User profile not found. Call /api/auth/bootstrap first.")
    }

    const activeWarn = await this.userRepository.findLatestWarn(userId)
    return { user, activeWarn }
  }

  async getPublicProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError("User not found")
    }
    return user
  }

  async updateMe(userId: string, input: UpdateUserProfileInput): Promise<User> {
    const existing = await this.userRepository.findById(userId)

    if (!existing) {
      throw new NotFoundError("User profile not found. Call /api/auth/bootstrap first.")
    }

    const updated = await this.userRepository.updateProfile(userId, input)
    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.USER_PROFILE_UPDATED,
      actorId: userId,
      targetType: ACTIVITY_TARGET_TYPES.USER,
      targetId: userId,
      summary: "Profile updated",
      metadata: {
        fields: Object.keys(input).filter((key) => input[key as keyof UpdateUserProfileInput] !== undefined),
      },
    })
    return updated
  }

  async acknowledgeWarn(userId: string, actionId: string) {
    const action = await this.userRepository.acknowledgeWarn(actionId, userId)
    if (!action) {
      throw new NotFoundError("Warn not found")
    }
    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.USER_WARN_ACKNOWLEDGED,
      actorId: userId,
      targetType: ACTIVITY_TARGET_TYPES.USER,
      targetId: userId,
      summary: "Warning acknowledged",
      metadata: { warnId: actionId },
    })
    return action
  }

  async listMatchHistory(userId: string, rawLimit?: number): Promise<MatchHistoryItemDto[]> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError("User not found")
    }

    const limit = Number.isFinite(rawLimit)
      ? Math.min(MAX_MATCH_HISTORY_LIMIT, Math.max(1, Math.floor(rawLimit!)))
      : DEFAULT_MATCH_HISTORY_LIMIT

    const matches = await this.matchRepository.findRecentEndedByUserId(userId, limit)
    return matches.map((match) => toMatchHistoryItemDto(match, userId))
  }
}
