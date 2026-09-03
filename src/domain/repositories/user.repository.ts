import type {
  AuthClaims,
  UpdateMatchStatsInput,
  UpdateUserProfileInput,
  User,
  UserRole,
  UserStatus,
} from "../entities/user.entity.js"
import type { CreateModerationActionData, ModerationActionWithActor } from "../entities/moderation.entity.js"

export type AdminUserFilters = {
  search?: string
  status?: UserStatus
  role?: UserRole
}

export interface IUserRepository {
  upsertFromAuth(claims: AuthClaims, role: UserRole): Promise<User>
  findById(id: string): Promise<User | null>
  findByEmails(emails: string[]): Promise<User[]>
  findManyAdmin(filters: AdminUserFilters): Promise<User[]>
  countAdmins(): Promise<number>
  updateProfile(id: string, input: UpdateUserProfileInput): Promise<User>
  updateMatchStats(id: string, input: UpdateMatchStatsInput): Promise<User>
  setSuspended(id: string, reason: string): Promise<User>
  clearSuspended(id: string): Promise<User>
  setRole(id: string, role: UserRole): Promise<User>
  createModerationAction(data: CreateModerationActionData): Promise<ModerationActionWithActor>
  listModerationActions(subjectUserId: string, limit?: number): Promise<ModerationActionWithActor[]>
  findLatestWarn(subjectUserId: string): Promise<ModerationActionWithActor | null>
  acknowledgeWarn(actionId: string, subjectUserId: string): Promise<ModerationActionWithActor | null>
}
