export function parseAdminEmails(raw: string): Set<string> {
  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  )
}

export function resolveUserRole(email: string, adminEmails: Set<string>): "USER" | "ADMIN" {
  return adminEmails.has(email.trim().toLowerCase()) ? "ADMIN" : "USER"
}
