import type { NextFunction, Request, Response } from "express"
import type { JwtVerifier } from "../../infrastructure/auth/jwt-verifier.js"
import type { IUserRepository } from "../../domain/repositories/user.repository.js"
import { parseAdminEmails, resolveUserRole } from "../../shared/admin/admin-emails.js"
import { resolveEmailVerified } from "../../shared/auth/email-verified.js"
import { ForbiddenError, UnauthorizedError } from "../../shared/errors/app-error.js"

export function createAuthMiddleware(
  jwtVerifier: JwtVerifier,
  userRepository: IUserRepository,
  adminEmailsRaw: string,
  options?: { allowSuspended?: boolean },
) {
  const adminEmails = parseAdminEmails(adminEmailsRaw)
  const allowSuspended = options?.allowSuspended === true

  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization

      if (!header?.startsWith("Bearer ")) {
        throw new UnauthorizedError("Missing Bearer token")
      }

      const token = header.slice("Bearer ".length).trim()

      if (!token) {
        throw new UnauthorizedError("Missing Bearer token")
      }

      const claims = await jwtVerifier.verify(token)
      const user = await userRepository.findById(claims.userId)

      if (!allowSuspended && user?.status === "SUSPENDED") {
        throw new ForbiddenError(
          user.suspendReason
            ? `Account suspended: ${user.suspendReason}`
            : "Account suspended",
        )
      }

      const role = user?.role ?? resolveUserRole(claims.email, adminEmails)

      req.auth = {
        ...claims,
        emailVerified: resolveEmailVerified(claims.emailVerified, user?.emailVerified ?? false, role),
      }
      next()
    } catch (error) {
      next(error)
    }
  }
}
