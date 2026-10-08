import { Router } from "express"
import type { Container } from "../../config/container.js"
import { asyncHandler } from "../middleware/error.middleware.js"

export function createUserRoutes(container: Container) {
  const router = Router()

  router.get("/me", container.authMiddleware, asyncHandler(container.userController.getMe))
  router.patch("/me", container.authMiddleware, asyncHandler(container.userController.updateMe))
  router.post(
    "/me/warns/:id/acknowledge",
    container.authMiddleware,
    asyncHandler(container.userController.acknowledgeWarn),
  )
  router.get(
    "/:id/matches",
    container.authMiddleware,
    asyncHandler(container.userController.listMatches),
  )
  router.get(
    "/:id/history",
    container.authMiddleware,
    asyncHandler(container.userController.listHistory),
  )
  router.get("/:id", container.authMiddleware, asyncHandler(container.userController.getPublic))

  return router
}
