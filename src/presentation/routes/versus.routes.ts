import { Router } from "express"
import type { Container } from "../../config/container.js"
import { asyncHandler } from "../middleware/error.middleware.js"

export function createVersusRoutes(container: Container) {
  const router = Router()

  router.get("/matches/:id", container.authMiddleware, asyncHandler(container.versusController.getMatch))
  router.get(
    "/matches/:id/review",
    container.authMiddleware,
    asyncHandler(container.versusController.getReview),
  )
  router.post("/matches/:id/run", container.authMiddleware, asyncHandler(container.versusController.run))
  router.post(
    "/matches/:id/submit",
    container.authMiddleware,
    asyncHandler(container.versusController.submit),
  )
  router.post(
    "/matches/:id/leave",
    container.authMiddleware,
    asyncHandler(container.versusController.leave),
  )

  return router
}
