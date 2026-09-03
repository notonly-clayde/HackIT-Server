import type { Request, Response } from "express"
import type { LobbyService } from "../../application/services/lobby.service.js"
import { toLobbyStateDto } from "../../application/mappers/lobby.mapper.js"
import { BadRequestError, UnauthorizedError } from "../../shared/errors/app-error.js"

export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}

  getLobbyState = async (req: Request, res: Response) => {
    this.requireAuth(req)

    const id = this.requireId(req.params.id)
    const state = await this.lobbyService.getLobbyState(id)
    res.json(toLobbyStateDto(state))
  }

  private requireAuth(req: Request) {
    if (!req.auth) {
      throw new UnauthorizedError()
    }
    return req.auth
  }

  private requireId(id: string | string[] | undefined): string {
    if (!id || Array.isArray(id)) {
      throw new BadRequestError("Invalid tournament id")
    }
    return id
  }
}
