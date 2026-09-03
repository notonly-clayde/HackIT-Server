import type { Request, Response } from "express"
import type { ReportService } from "../../application/services/report.service.js"
import type { AdminUserService } from "../../application/services/admin-user.service.js"
import {
  adminUserListQuerySchema,
  createReportSchema,
  resolveReportSchema,
  setUserRoleSchema,
  suspendUserSchema,
  warnUserSchema,
} from "../../application/dto/moderation.dto.js"
import {
  toModerationActionResponseDto,
  toReportResponseDto,
  toUserResponseDto,
} from "../../application/mappers/user.mapper.js"
import { BadRequestError } from "../../shared/errors/app-error.js"

export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  create = async (req: Request, res: Response) => {
    const parsed = createReportSchema.safeParse(req.body ?? {})
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid request body")
    }
    const report = await this.reportService.create(req.auth!.userId, parsed.data)
    res.status(201).json(toReportResponseDto(report))
  }

  listAdmin = async (req: Request, res: Response) => {
    const status =
      req.query.status === "open" || req.query.status === "resolved" || req.query.status === "dismissed"
        ? req.query.status
        : "open"
    const reports = await this.reportService.listAdmin(status)
    res.json(reports.map(toReportResponseDto))
  }

  countOpen = async (_req: Request, res: Response) => {
    const count = await this.reportService.countOpen()
    res.json({ count })
  }

  resolve = async (req: Request, res: Response) => {
    const id = this.requireId(req.params.id)
    const parsed = resolveReportSchema.safeParse(req.body ?? {})
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid request body")
    }
    const report = await this.reportService.resolve(id, req.auth!.userId, parsed.data)
    res.json(toReportResponseDto(report))
  }

  private requireId(id: string | string[] | undefined): string {
    if (!id || Array.isArray(id)) throw new BadRequestError("Invalid id")
    return id
  }
}

export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  list = async (req: Request, res: Response) => {
    const parsed = adminUserListQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid query")
    }
    const users = await this.adminUserService.list(parsed.data)
    res.json(users.map((u) => toUserResponseDto(u)))
  }

  getById = async (req: Request, res: Response) => {
    const id = this.requireId(req.params.id)
    const detail = await this.adminUserService.getDetail(id)
    res.json({
      user: toUserResponseDto(detail.user, { activeWarn: detail.activeWarn }),
      history: detail.history.map(toModerationActionResponseDto),
      reports: detail.reports.map(toReportResponseDto),
    })
  }

  warn = async (req: Request, res: Response) => {
    const id = this.requireId(req.params.id)
    const parsed = warnUserSchema.safeParse(req.body ?? {})
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid request body")
    }
    const detail = await this.adminUserService.warn(req.auth!.userId, id, parsed.data.note)
    res.json({
      user: toUserResponseDto(detail.user, { activeWarn: detail.activeWarn }),
      history: detail.history.map(toModerationActionResponseDto),
      reports: detail.reports.map(toReportResponseDto),
    })
  }

  suspend = async (req: Request, res: Response) => {
    const id = this.requireId(req.params.id)
    const parsed = suspendUserSchema.safeParse(req.body ?? {})
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid request body")
    }
    const detail = await this.adminUserService.suspend(req.auth!.userId, id, parsed.data.reason)
    res.json({
      user: toUserResponseDto(detail.user, { activeWarn: detail.activeWarn }),
      history: detail.history.map(toModerationActionResponseDto),
      reports: detail.reports.map(toReportResponseDto),
    })
  }

  unsuspend = async (req: Request, res: Response) => {
    const id = this.requireId(req.params.id)
    const detail = await this.adminUserService.unsuspend(req.auth!.userId, id)
    res.json({
      user: toUserResponseDto(detail.user, { activeWarn: detail.activeWarn }),
      history: detail.history.map(toModerationActionResponseDto),
      reports: detail.reports.map(toReportResponseDto),
    })
  }

  setRole = async (req: Request, res: Response) => {
    const id = this.requireId(req.params.id)
    const parsed = setUserRoleSchema.safeParse(req.body ?? {})
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid request body")
    }
    const detail = await this.adminUserService.setRole(req.auth!.userId, id, parsed.data.role)
    res.json({
      user: toUserResponseDto(detail.user, { activeWarn: detail.activeWarn }),
      history: detail.history.map(toModerationActionResponseDto),
      reports: detail.reports.map(toReportResponseDto),
    })
  }

  private requireId(id: string | string[] | undefined): string {
    if (!id || Array.isArray(id)) throw new BadRequestError("Invalid id")
    return id
  }
}
