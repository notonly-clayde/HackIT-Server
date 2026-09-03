import { Router } from "express"
import type { Container } from "../../config/container.js"
import { asyncHandler } from "../middleware/error.middleware.js"

export function createWorkspaceRoutes(container: Container) {
  const router = Router({ mergeParams: true })

  router.get("/me", container.authMiddleware, asyncHandler(container.workspaceController.getMyWorkspace))
  router.put("/me", container.authMiddleware, asyncHandler(container.workspaceController.saveMyWorkspace))
  router.get(
    "/players/:userId",
    container.authMiddleware,
    asyncHandler(container.workspaceController.getPlayerWorkspace),
  )

  return router
}
