import { Router } from "express"
import type { Container } from "../../config/container.js"
import { asyncHandler } from "../middleware/error.middleware.js"

export function createLobbyRoutes(container: Container) {
  const router = Router({ mergeParams: true })

  router.get("/", container.authMiddleware, asyncHandler(container.lobbyController.getLobbyState))

  return router
}
