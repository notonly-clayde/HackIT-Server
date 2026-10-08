import type { Request, Response } from "express"
import type { UserService } from "../../application/services/user.service.js"
import type { ProfileHistoryService } from "../../application/services/profile-history.service.js"
import { updateUserSchema } from "../../application/dto/user.dto.js"
import {
  toModerationActionResponseDto,
  toPublicUserResponseDto,
  toUserResponseDto,
} from "../../application/mappers/user.mapper.js"
import { BadRequestError } from "../../shared/errors/app-error.js"

export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly profileHistoryService: ProfileHistoryService,
  ) {}

  getMe = async (req: Request, res: Response) => {
    const { user, activeWarn } = await this.userService.getMe(req.auth!.userId)
    res.json(toUserResponseDto(user, { activeWarn }))
  }

  getPublic = async (req: Request, res: Response) => {
    const id = req.params.id
    if (!id || Array.isArray(id)) throw new BadRequestError("Invalid user id")
    const user = await this.userService.getPublicProfile(id)
    res.json(toPublicUserResponseDto(user))
  }

  listMatches = async (req: Request, res: Response) => {
    const id = req.params.id
    if (!id || Array.isArray(id)) throw new BadRequestError("Invalid user id")
    const raw = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit
    const parsed = typeof raw === "string" && raw.trim() !== "" ? Number(raw) : undefined
    const matches = await this.userService.listMatchHistory(id, parsed)
    res.json(matches)
  }

  listHistory = async (req: Request, res: Response) => {
    const id = req.params.id
    if (!id || Array.isArray(id)) throw new BadRequestError("Invalid user id")
    const rawLimit = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit
    const limit = typeof rawLimit === "string" && rawLimit.trim() !== "" ? Number(rawLimit) : undefined
    const rawKind = Array.isArray(req.query.kind) ? req.query.kind[0] : req.query.kind
    const kind = rawKind === undefined ? "all" : rawKind
    if (kind !== "all" && kind !== "versus" && kind !== "tournament") {
      throw new BadRequestError("Invalid history kind")
    }
    const items = await this.profileHistoryService.listHistory(id, req.auth!.userId, kind, limit)
    res.json(items)
  }

  updateMe = async (req: Request, res: Response) => {
    const parsed = updateUserSchema.safeParse(req.body)

    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid request body")
    }

    const user = await this.userService.updateMe(req.auth!.userId, parsed.data)
    res.json(toUserResponseDto(user))
  }

  acknowledgeWarn = async (req: Request, res: Response) => {
    const id = req.params.id
    if (!id || Array.isArray(id)) throw new BadRequestError("Invalid warn id")
    const action = await this.userService.acknowledgeWarn(req.auth!.userId, id)
    res.json(toModerationActionResponseDto(action))
  }
}
