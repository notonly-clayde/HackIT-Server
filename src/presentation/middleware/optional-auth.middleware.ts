import type { NextFunction, Request, Response } from "express"
import type { JwtVerifier } from "../../infrastructure/auth/jwt-verifier.js"
import type { IUserRepository } from "../../domain/repositories/user.repository.js"
import { parseAdminEmails, resolveUserRole } from "../../shared/admin/admin-emails.js"
import { resolveEmailVerified } from "../../shared/auth/email-verified.js"

export function createOptionalAuthMiddleware(
  jwtVerifier: JwtVerifier,
  userRepository: IUserRepository,
  adminEmailsRaw: string,
) {
  const adminEmails = parseAdminEmails(adminEmailsRaw)

  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization

      if (!header?.startsWith("Bearer ")) {
        return next()
      }

      const token = header.slice("Bearer ".length).trim()
      if (!token) {
        return next()
      }

      const claims = await jwtVerifier.verify(token)
      const user = await userRepository.findById(claims.userId)
      const role = user?.role ?? resolveUserRole(claims.email, adminEmails)

      req.auth = {
        ...claims,
        emailVerified: resolveEmailVerified(claims.emailVerified, user?.emailVerified ?? false, role),
      }

      next()
    } catch {
      next()
    }
  }
}
