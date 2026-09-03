import { Router } from "express"

import type { Container } from "../../config/container.js"

import { asyncHandler } from "../middleware/error.middleware.js"

import { createLobbyRoutes } from "./lobby.routes.js"

import { createTournamentProblemRoutes } from "./tournament-problem.routes.js"

import { createWorkspaceRoutes } from "./workspace.routes.js"



export function createTournamentRoutes(container: Container) {

  const router = Router()



  router.get("/", asyncHandler(container.tournamentController.list))

  router.post("/", container.authMiddleware, asyncHandler(container.tournamentController.create))

  router.post(

    "/:id/verify-password",

    container.authMiddleware,

    asyncHandler(container.tournamentController.verifyPassword),

  )

  router.post(

    "/:id/start",

    container.authMiddleware,

    asyncHandler(container.tournamentLiveController.start),

  )

  router.post(

    "/:id/pause",

    container.authMiddleware,

    asyncHandler(container.tournamentLiveController.pause),

  )

  router.post(

    "/:id/resume",

    container.authMiddleware,

    asyncHandler(container.tournamentLiveController.resume),

  )

  router.post(

    "/:id/end",

    container.authMiddleware,

    asyncHandler(container.tournamentLiveController.end),

  )

  router.use("/:id/lobby", createLobbyRoutes(container))

  router.use("/:id/problems", createTournamentProblemRoutes(container))

  router.use("/:id/workspace", createWorkspaceRoutes(container))

  router.get(

    "/:id/standings",

    container.optionalAuthMiddleware,

    asyncHandler(container.standingsController.getByTournamentId),

  )

  router.get(

    "/:id",

    container.optionalAuthMiddleware,

    asyncHandler(container.tournamentController.getById),

  )

  router.patch("/:id", container.authMiddleware, asyncHandler(container.tournamentController.update))

  router.delete("/:id", container.authMiddleware, asyncHandler(container.tournamentController.remove))



  return router

}

