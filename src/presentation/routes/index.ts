import { Router } from "express"
import type { Container } from "../../config/container.js"
import { asyncHandler } from "../middleware/error.middleware.js"
import { createAuthRoutes } from "./auth.routes.js"
import { createTournamentRoutes } from "./tournament.routes.js"
import { createUserRoutes } from "./user.routes.js"
import { createProblemRoutes, createAdminProblemRoutes } from "./problem.routes.js"
import {
  createAdminReportRoutes,
  createAdminUserRoutes,
  createReportRoutes,
} from "./moderation.routes.js"
import { createAdminActivityLogRoutes } from "./activity-log.routes.js"
import { createVersusRoutes } from "./versus.routes.js"

export function createApiRoutes(container: Container) {
  const router = Router()

  router.get("/health", asyncHandler(container.healthController.getHealth))
  router.use("/auth", createAuthRoutes(container))
  router.use("/users", createUserRoutes(container))
  router.use("/reports", createReportRoutes(container))
  router.use("/tournaments", createTournamentRoutes(container))
  router.use("/problems", createProblemRoutes(container))
  router.use("/versus", createVersusRoutes(container))
  router.use("/admin/problems", createAdminProblemRoutes(container))
  router.use("/admin/reports", createAdminReportRoutes(container))
  router.use("/admin/users", createAdminUserRoutes(container))
  router.use("/admin/activity-logs", createAdminActivityLogRoutes(container))

  return router
}
