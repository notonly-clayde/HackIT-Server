import { Router } from "express"
import type { Container } from "../../config/container.js"
import { asyncHandler } from "../middleware/error.middleware.js"

export function createLobbyRoutes(container: Container) {
  const router = Router()

  router.get(
    "/:id/lobby",
    container.authMiddleware,
    asyncHandler(container.lobbyController.getLobbyState),
  )

  return router
}
