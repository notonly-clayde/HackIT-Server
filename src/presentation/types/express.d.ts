import type { AuthClaims } from "../../domain/entities/user.entity.js"

declare global {
  namespace Express {
    interface Request {
      auth?: AuthClaims
    }
  }
}

export {}
