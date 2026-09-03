import type { NextFunction, Request, Response } from "express"
import type { IUserRepository } from "../../domain/repositories/user.repository.js"
import { ForbiddenError, UnauthorizedError } from "../../shared/errors/app-error.js"

export function createAdminMiddleware(userRepository: IUserRepository) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.auth) {
        throw new UnauthorizedError()
      }

      const user = await userRepository.findById(req.auth.userId)
      if (!user || user.role !== "ADMIN") {
        throw new ForbiddenError("Admin access required")
      }

      if (user.status === "SUSPENDED") {
        throw new ForbiddenError("Account suspended")
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
