import { Router } from "express"
import type { Container } from "../../config/container.js"
import { asyncHandler } from "../middleware/error.middleware.js"
import { createLobbyRoutes } from "./lobby.routes.js"

export function createTournamentRoutes(container: Container) {
  const router = Router()

  router.get("/", asyncHandler(container.tournamentController.list))
  router.post("/", container.authMiddleware, asyncHandler(container.tournamentController.create))
  router.post(
    "/:id/verify-password",
    container.authMiddleware,
    asyncHandler(container.tournamentController.verifyPassword),
  )
  router.use(createLobbyRoutes(container))
  router.get("/:id", asyncHandler(container.tournamentController.getById))
  router.patch("/:id", container.authMiddleware, asyncHandler(container.tournamentController.update))
  router.delete("/:id", container.authMiddleware, asyncHandler(container.tournamentController.remove))

  return router
}