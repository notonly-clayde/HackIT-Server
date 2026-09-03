import { Router } from "express"
import type { Container } from "../../config/container.js"
import { asyncHandler } from "../middleware/error.middleware.js"

export function createAdminActivityLogRoutes(container: Container) {
  const router = Router()
  router.get(
    "/",
    container.authMiddleware,
    container.adminMiddleware,
    asyncHandler(container.activityLogController.list),
  )
  return router
}
