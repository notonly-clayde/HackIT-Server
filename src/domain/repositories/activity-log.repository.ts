import type {
  ActivityLogListFilters,
  ActivityLogListResult,
  ActivityLogRecord,
  CreateActivityLogInput,
} from "../entities/activity-log.entity.js"

export interface IActivityLogRepository {
  create(input: CreateActivityLogInput): Promise<ActivityLogRecord>
  list(filters: ActivityLogListFilters): Promise<ActivityLogListResult>
}
