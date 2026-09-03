import { createRemoteJWKSet, jwtVerify } from "jose"
import type { AuthClaims } from "../../domain/entities/user.entity.js"
import { UnauthorizedError } from "../../shared/errors/app-error.js"

export class JwtVerifier {
  private jwks: ReturnType<typeof createRemoteJWKSet>
  private issuer: string

  constructor(neonAuthUrl: string) {
    const authUrl = new URL(neonAuthUrl)
    this.issuer = authUrl.origin
    this.jwks = createRemoteJWKSet(new URL(`${neonAuthUrl.replace(/\/$/, "")}/.well-known/jwks.json`))
  }

  async verify(token: string): Promise<AuthClaims> {
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
        audience: this.issuer,
        algorithms: ["EdDSA"],
      })

      const userId = typeof payload.sub === "string" ? payload.sub : null
      const email = typeof payload.email === "string" ? payload.email : null

      if (!userId || !email) {
        throw new UnauthorizedError("Invalid token claims")
      }

      const name =
        typeof payload.name === "string"
          ? payload.name
          : typeof payload.email === "string"
            ? email.split("@")[0]
            : "User"

      // Neon JWTs often omit email_verified; treat missing as unknown (false here,
      // bootstrap merges with Neon session emailVerified from the client).
      return {
        userId,
        email,
        name,
        emailVerified: payload.email_verified === true,
        avatarUrl: typeof payload.picture === "string" ? payload.picture : null,
      }
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error
      throw new UnauthorizedError("Invalid or expired token")
    }
  }
}
