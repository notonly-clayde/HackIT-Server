import type { Request, Response } from "express"
import type { AuthService } from "../../application/services/auth.service.js"
import { bootstrapSchema } from "../../application/dto/auth.dto.js"
import { toUserResponseDto } from "../../application/mappers/user.mapper.js"
import { parseAdminEmails, resolveUserRole } from "../../shared/admin/admin-emails.js"
import { resolveEmailVerified } from "../../shared/auth/email-verified.js"
import { BadRequestError, ForbiddenError } from "../../shared/errors/app-error.js"

export class AuthController {
  constructor(
    private readonly authService: AuthService,
    adminEmailsRaw: string,
  ) {
    this.adminEmails = parseAdminEmails(adminEmailsRaw)
  }

  private readonly adminEmails: Set<string>

  bootstrap = async (req: Request, res: Response) => {
    const parsed = bootstrapSchema.safeParse(req.body ?? {})

    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid request body")
    }

    const auth = req.auth!
    const role = resolveUserRole(auth.email, this.adminEmails)
    // Prefer Neon session verification from the client when the JWT omits email_verified.
    // Once either source says verified, keep verified (never wipe a true with a missing claim).
    const emailVerified = resolveEmailVerified(auth.emailVerified, parsed.data.emailVerified === true, role)

    const { user, activeWarn } = await this.authService.bootstrapUser({
      ...auth,
      emailVerified,
    })

    if (user.status === "SUSPENDED") {
      throw new ForbiddenError(
        user.suspendReason ? `Account suspended: ${user.suspendReason}` : "Account suspended",
      )
    }

    res.json(toUserResponseDto(user, { activeWarn }))
  }
}
