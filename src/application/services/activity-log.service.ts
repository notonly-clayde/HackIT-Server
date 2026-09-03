import type {
  ActivityLogListFilters,
  ActivityLogListResult,
  CreateActivityLogInput,
} from "../../domain/entities/activity-log.entity.js"
import type { IActivityLogRepository } from "../../domain/repositories/activity-log.repository.js"

export class ActivityLogService {
  constructor(private readonly activityLogRepository: IActivityLogRepository) {}

  /** Best-effort write — never throws into callers. */
  async record(input: CreateActivityLogInput): Promise<void> {
    try {
      await this.activityLogRepository.create(input)
    } catch (err) {
      console.error("[ActivityLog] failed to record", input.action, err)
    }
  }

  async list(filters: ActivityLogListFilters): Promise<ActivityLogListResult> {
    return this.activityLogRepository.list(filters)
  }
}
