import type { UserRole } from "../../domain/entities/user.entity.js"

/** Neon JWTs often omit email_verified; DB is synced from bootstrap using the Neon session. */
export function isAdminRole(role: UserRole | "user" | "admin" | undefined): boolean {
  return role === "ADMIN" || role === "admin"
}

export function resolveEmailVerified(
  jwtClaim: boolean,
  dbVerified: boolean,
  role?: UserRole | "user" | "admin",
): boolean {
  if (isAdminRole(role)) return true
  return jwtClaim === true || dbVerified === true
}

export function isUserEmailVerified(user: {
  emailVerified: boolean
  role: UserRole
}): boolean {
  return resolveEmailVerified(false, user.emailVerified, user.role)
}
