import { Router } from "express"
import type { Container } from "../../config/container.js"
import { asyncHandler } from "../middleware/error.middleware.js"

export function createAdminDashboardRoutes(container: Container) {
  const router = Router()
  router.get(
    "/summary",
    container.authMiddleware,
    container.adminMiddleware,
    asyncHandler(container.adminDashboardController.getSummary),
  )
  return router
}
