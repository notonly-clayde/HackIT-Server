import "dotenv/config"
import pg from "pg"

function parseAdminEmails(raw) {
  return (raw ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

const adminEmails = parseAdminEmails(process.env.ADMIN_EMAILS)
if (adminEmails.length === 0) {
  console.error("ADMIN_EMAILS is empty. Set it in .env first.")
  process.exit(1)
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

try {
  const result = await client.query(
    `
      UPDATE neon_auth."user"
      SET "emailVerified" = true, "updatedAt" = NOW()
      WHERE lower(email) = ANY($1::text[])
      RETURNING email, "emailVerified", role
    `,
    [adminEmails],
  )

  if (result.rowCount === 0) {
    console.log("No Neon Auth users matched ADMIN_EMAILS:", [...adminEmails].join(", "))
    console.log("Sign up those emails in the app first, then re-run this script.")
    process.exit(1)
  }

  for (const row of result.rows) {
    console.log(`Verified ${row.email} (role=${row.role ?? "user"}) in neon_auth.user`)
  }
} finally {
  await client.end()
}
