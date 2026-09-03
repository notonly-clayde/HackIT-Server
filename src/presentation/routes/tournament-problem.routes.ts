import { Router } from "express"
import type { Container } from "../../config/container.js"
import { asyncHandler } from "../middleware/error.middleware.js"

export function createTournamentProblemRoutes(container: Container) {
  const router = Router({ mergeParams: true })

  router.get("/", container.authMiddleware, asyncHandler(container.tournamentProblemController.list))
  router.post("/", container.authMiddleware, asyncHandler(container.tournamentProblemController.attach))
  router.put(
    "/reorder",
    container.authMiddleware,
    asyncHandler(container.tournamentProblemController.reorder),
  )
  router.patch(
    "/:problemId",
    container.authMiddleware,
    asyncHandler(container.tournamentProblemController.update),
  )
  router.delete(
    "/:problemId",
    container.authMiddleware,
    asyncHandler(container.tournamentProblemController.detach),
  )
  router.post(
    "/:problemId/run",
    container.authMiddleware,
    asyncHandler(container.submissionController.runTournament),
  )
  router.post(
    "/:problemId/submit",
    container.authMiddleware,
    asyncHandler(container.submissionController.submitTournament),
  )

  return router
}
