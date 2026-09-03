import { Router } from "express"
import type { Container } from "../../config/container.js"
import { asyncHandler } from "../middleware/error.middleware.js"

export function createReportRoutes(container: Container) {
  const router = Router()
  router.post("/", container.authMiddleware, asyncHandler(container.reportController.create))
  return router
}

export function createAdminReportRoutes(container: Container) {
  const router = Router()
  router.get(
    "/",
    container.authMiddleware,
    container.adminMiddleware,
    asyncHandler(container.reportController.listAdmin),
  )
  router.get(
    "/count",
    container.authMiddleware,
    container.adminMiddleware,
    asyncHandler(container.reportController.countOpen),
  )
  router.post(
    "/:id/resolve",
    container.authMiddleware,
    container.adminMiddleware,
    asyncHandler(container.reportController.resolve),
  )
  return router
}

export function createAdminUserRoutes(container: Container) {
  const router = Router()
  router.get(
    "/",
    container.authMiddleware,
    container.adminMiddleware,
    asyncHandler(container.adminUserController.list),
  )
  router.get(
    "/:id",
    container.authMiddleware,
    container.adminMiddleware,
    asyncHandler(container.adminUserController.getById),
  )
  router.post(
    "/:id/warn",
    container.authMiddleware,
    container.adminMiddleware,
    asyncHandler(container.adminUserController.warn),
  )
  router.post(
    "/:id/suspend",
    container.authMiddleware,
    container.adminMiddleware,
    asyncHandler(container.adminUserController.suspend),
  )
  router.post(
    "/:id/unsuspend",
    container.authMiddleware,
    container.adminMiddleware,
    asyncHandler(container.adminUserController.unsuspend),
  )
  router.post(
    "/:id/role",
    container.authMiddleware,
    container.adminMiddleware,
    asyncHandler(container.adminUserController.setRole),
  )
  return router
}
