import { Router } from "express"
import type { Container } from "../../config/container.js"
import { asyncHandler } from "../middleware/error.middleware.js"

export function createAuthRoutes(container: Container) {
  const router = Router()

  router.post(
    "/bootstrap",
    container.bootstrapAuthMiddleware,
    asyncHandler(container.authController.bootstrap),
  )

  return router
}
