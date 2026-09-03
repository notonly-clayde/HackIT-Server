import { Router } from "express"
import type { Container } from "../../config/container.js"
import { asyncHandler } from "../middleware/error.middleware.js"

export function createProblemRoutes(container: Container) {
  const router = Router()

  router.get("/", container.authMiddleware, asyncHandler(container.problemController.listCatalog))
  router.get("/mine", container.authMiddleware, asyncHandler(container.problemController.listMine))
  router.post("/", container.authMiddleware, asyncHandler(container.problemController.create))
  router.get("/:id", container.authMiddleware, asyncHandler(container.problemController.getById))
  router.patch("/:id", container.authMiddleware, asyncHandler(container.problemController.update))
  router.post(
    "/:id/submit-review",
    container.authMiddleware,
    asyncHandler(container.problemController.submitForReview),
  )
  router.post(
    "/:id/run",
    container.authMiddleware,
    asyncHandler(container.submissionController.runPractice),
  )
  router.post(
    "/:id/submit",
    container.authMiddleware,
    asyncHandler(container.submissionController.submitPractice),
  )

  return router
}

export function createAdminProblemRoutes(container: Container) {
  const router = Router()

  router.get(
    "/",
    container.authMiddleware,
    container.adminMiddleware,
    asyncHandler(container.problemController.listPendingAdmin),
  )
  router.post(
    "/:id/approve",
    container.authMiddleware,
    container.adminMiddleware,
    asyncHandler(container.problemController.approve),
  )
  router.post(
    "/:id/reject",
    container.authMiddleware,
    container.adminMiddleware,
    asyncHandler(container.problemController.reject),
  )
  router.post(
    "/:id/unpublish",
    container.authMiddleware,
    container.adminMiddleware,
    asyncHandler(container.problemController.unpublish),
  )

  return router
}
