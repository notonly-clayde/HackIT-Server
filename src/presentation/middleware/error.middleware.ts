import type { NextFunction, Request, Response } from "express"
import { AppError } from "../../shared/errors/app-error.js"
import { ZodError } from "zod"

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message })
    return
  }

  if (err instanceof ZodError) {
    res.status(400).json({ error: err.issues[0]?.message ?? "Validation error" })
    return
  }

  console.error(err)
  res.status(500).json({ error: "Internal server error" })
}

export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => void | Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}
