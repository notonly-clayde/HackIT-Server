import type { IReportRepository } from "../../domain/repositories/report.repository.js"
import type { IUserRepository } from "../../domain/repositories/user.repository.js"
import type { ITournamentRepository } from "../../domain/repositories/tournament.repository.js"
import type { IProblemRepository } from "../../domain/repositories/problem.repository.js"
import type { CreateReportDto, ResolveReportDto } from "../dto/moderation.dto.js"
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_TARGET_TYPES,
} from "../../domain/entities/activity-log.entity.js"
import { BadRequestError, NotFoundError } from "../../shared/errors/app-error.js"
import type {
  ReportCategory,
  ReportTargetType,
  ReportWithReporter,
} from "../../domain/entities/moderation.entity.js"
import type { ActivityLogService } from "./activity-log.service.js"

const targetTypeMap: Record<CreateReportDto["targetType"], ReportTargetType> = {
  user: "USER",
  tournament: "TOURNAMENT",
  problem: "PROBLEM",
}

const categoryMap: Record<CreateReportDto["category"], ReportCategory> = {
  harassment: "HARASSMENT",
  hate: "HATE",
  sexual: "SEXUAL",
  spam: "SPAM",
  cheating: "CHEATING",
  other: "OTHER",
}

const MAX_REPORTS_PER_HOUR = 10

export class ReportService {
  constructor(
    private readonly reportRepository: IReportRepository,
    private readonly userRepository: IUserRepository,
    private readonly tournamentRepository: ITournamentRepository,
    private readonly problemRepository: IProblemRepository,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async create(reporterId: string, input: CreateReportDto): Promise<ReportWithReporter> {
    const since = new Date(Date.now() - 60 * 60 * 1000)
    const recentCount = await this.reportRepository.countOpenByReporterSince(reporterId, since)
    if (recentCount >= MAX_REPORTS_PER_HOUR) {
      throw new BadRequestError("Too many reports. Please try again later.")
    }

    const targetType = targetTypeMap[input.targetType]
    await this.assertTargetExists(targetType, input.targetId)

    if (targetType === "USER" && input.targetId === reporterId) {
      throw new BadRequestError("You cannot report yourself")
    }

    if (input.contextTournamentId) {
      const tournament = await this.tournamentRepository.findByIdWithHost(input.contextTournamentId)
      if (!tournament) {
        throw new BadRequestError("Context tournament not found")
      }
    }

    const created = await this.reportRepository.create({
      reporterId,
      targetType,
      targetId: input.targetId,
      contextTournamentId: input.contextTournamentId,
      category: categoryMap[input.category],
      details: input.details,
    })

    const full = await this.reportRepository.findById(created.id)
    if (!full) throw new NotFoundError("Report not found")

    void this.activityLogService.record({
      action: ACTIVITY_ACTIONS.REPORT_CREATED,
      actorId: reporterId,
      targetType: ACTIVITY_TARGET_TYPES.REPORT,
      targetId: full.id,
      tournamentId: input.contextTournamentId ?? (targetType === "TOURNAMENT" ? input.targetId : null),
      summary: `Report filed (${full.category.toLowerCase()} → ${targetType.toLowerCase()})`,
      metadata: {
        category: full.category,
        reportTargetType: targetType,
        reportTargetId: input.targetId,
      },
    })

    return full
  }

  async listAdmin(status?: "open" | "resolved" | "dismissed") {
    const mapped =
      status === "open"
        ? "OPEN"
        : status === "resolved"
          ? "RESOLVED"
          : status === "dismissed"
            ? "DISMISSED"
            : undefined
    return this.reportRepository.findMany(mapped)
  }

  async countOpen() {
    return this.reportRepository.countOpen()
  }

  async resolve(reportId: string, actorId: string, input: ResolveReportDto) {
    const report = await this.reportRepository.findById(reportId)
    if (!report) throw new NotFoundError("Report not found")
    if (report.status !== "OPEN") {
      throw new BadRequestError("Report is already resolved")
    }

    if (input.suspendUser) {
      if (report.targetType !== "USER") {
        throw new BadRequestError("Can only suspend when the report target is a user")
      }
      if (!input.suspendReason?.trim()) {
        throw new BadRequestError("Suspend reason is required")
      }
      await this.suspendUser(actorId, report.targetId, input.suspendReason.trim())
    }

    const resolved = await this.reportRepository.resolve(reportId, {
      status: input.resolution === "resolved" ? "RESOLVED" : "DISMISSED",
      resolutionNote: input.note,
      resolvedById: actorId,
    })

    void this.activityLogService.record({
      action:
        input.resolution === "resolved"
          ? ACTIVITY_ACTIONS.REPORT_RESOLVED
          : ACTIVITY_ACTIONS.REPORT_DISMISSED,
      actorId,
      targetType: ACTIVITY_TARGET_TYPES.REPORT,
      targetId: reportId,
      tournamentId: report.contextTournamentId,
      summary: `Report ${input.resolution}`,
      metadata: {
        note: input.note ?? null,
        suspendedUser: Boolean(input.suspendUser),
      },
    })

    return resolved
  }

  private async suspendUser(actorId: string, subjectId: string, reason: string) {
    const subject = await this.userRepository.findById(subjectId)
    if (!subject) throw new NotFoundError("User not found")
    if (subject.status === "SUSPENDED") return

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
      summary: `Suspended ${subject.displayName} (via report)`,
      metadata: { reason, via: "report" },
    })
  }

  private async assertTargetExists(targetType: ReportTargetType, targetId: string) {
    if (targetType === "USER") {
      const user = await this.userRepository.findById(targetId)
      if (!user) throw new NotFoundError("Reported user not found")
      return
    }
    if (targetType === "TOURNAMENT") {
      const tournament = await this.tournamentRepository.findByIdWithHost(targetId)
      if (!tournament) throw new NotFoundError("Reported tournament not found")
      return
    }
    const problem = await this.problemRepository.findById(targetId)
    if (!problem) throw new NotFoundError("Reported problem not found")
  }
}
