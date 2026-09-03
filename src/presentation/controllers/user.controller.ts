import type { Request, Response } from "express"
import type { UserService } from "../../application/services/user.service.js"
import { updateUserSchema } from "../../application/dto/user.dto.js"
import {
  toModerationActionResponseDto,
  toPublicUserResponseDto,
  toUserResponseDto,
} from "../../application/mappers/user.mapper.js"
import { BadRequestError } from "../../shared/errors/app-error.js"

export class UserController {
  constructor(private readonly userService: UserService) {}

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
