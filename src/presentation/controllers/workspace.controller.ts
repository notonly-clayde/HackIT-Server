import type { Request, Response } from "express"
import type { WorkspaceService } from "../../application/services/workspace.service.js"
import { saveMyWorkspaceSchema } from "../../application/dto/workspace.dto.js"
import { BadRequestError, UnauthorizedError } from "../../shared/errors/app-error.js"

export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  getMyWorkspace = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const tournamentId = this.requireId(req.params.id)
    const workspace = await this.workspaceService.getMyWorkspace(tournamentId, auth.userId)
    res.json(workspace)
  }

  saveMyWorkspace = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const tournamentId = this.requireId(req.params.id)
    const parsed = saveMyWorkspaceSchema.safeParse(req.body)

    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid request body")
    }

    const workspace = await this.workspaceService.saveMyWorkspace(
      tournamentId,
      auth.userId,
      parsed.data,
    )
    res.json(workspace)
  }

  getPlayerWorkspace = async (req: Request, res: Response) => {
    const auth = this.requireAuth(req)
    const tournamentId = this.requireId(req.params.id)
    const userId = this.requireId(req.params.userId)
    const problemId =
      typeof req.query.problemId === "string" && req.query.problemId.trim()
        ? req.query.problemId.trim()
        : undefined

    const workspace = await this.workspaceService.getPlayerWorkspace(
      tournamentId,
      auth.userId,
      userId,
      problemId,
    )
    res.json(workspace)
  }

  private requireAuth(req: Request) {
    if (!req.auth) {
      throw new UnauthorizedError()
    }
    return req.auth
  }

  private requireId(id: string | string[] | undefined): string {
    if (!id || Array.isArray(id)) {
      throw new BadRequestError("Invalid id")
    }
    return id
  }
}
