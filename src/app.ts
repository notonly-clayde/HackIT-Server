import express from "express"
import cors from "cors"
import helmet from "helmet"
import type { Env } from "./config/env.js"
import type { Container } from "./config/container.js"
import { createApiRoutes } from "./presentation/routes/index.js"
import { errorMiddleware } from "./presentation/middleware/error.middleware.js"

export function createApp(env: Env, container: Container) {
  const app = express()

  app.use(helmet())
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  )
  app.use(express.json())

  app.use("/api", createApiRoutes(container))
  app.use(errorMiddleware)

  return app
}
