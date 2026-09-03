import dns from "node:dns"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { catalogProblems } from "../prisma/catalog/problems.js"
import { defaultStarters, serializeCases } from "../prisma/catalog/types.js"
import { normalizeProblemTags } from "../src/shared/problems/tags.js"

dns.setDefaultResultOrder("ipv4first")

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

function loadEnvFile() {
  const envPath = path.join(root, ".env")
  if (!fs.existsSync(envPath)) return

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue
    const separator = line.indexOf("=")
    if (separator === -1) continue
    const key = line.slice(0, separator).trim()
    let value = line.slice(separator + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

loadEnvFile()

function parseAdminEmails(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

async function resolveAdminAuthor(prisma: PrismaClient) {
  const adminEmails = parseAdminEmails(process.env.ADMIN_EMAILS)

  if (adminEmails.length > 0) {
    const byEmail = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
        email: { in: adminEmails, mode: "insensitive" },
      },
      orderBy: { createdAt: "asc" },
    })
    if (byEmail) return byEmail
  }

  const anyAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
  })

  if (!anyAdmin) {
    throw new Error(
      "No ADMIN user found. Sign in once with an ADMIN_EMAILS account so bootstrap creates the user, then re-run db:seed.",
    )
  }

  return anyAdmin
}

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is required")
  }

  if (catalogProblems.length < 100) {
    throw new Error(`Expected 100+ catalog problems, found ${catalogProblems.length}`)
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      connectionTimeoutMillis: 15_000,
    }),
  })

  try {
    const author = await resolveAdminAuthor(prisma)
    console.log(`Seeding ${catalogProblems.length} problems as ${author.displayName} <${author.email}>`)

    let upserted = 0
    for (const problem of catalogProblems) {
      const tags = normalizeProblemTags(problem.tags)
      if (tags.length === 0) {
        throw new Error(`Problem ${problem.seedKey} has no valid tags`)
      }

      const testCases = [
        ...serializeCases(problem.samples, problem.solve, true),
        ...serializeCases(problem.hiddens, problem.solve, false),
      ]

      if (!testCases.some((t) => t.isSample) || !testCases.some((t) => !t.isSample)) {
        throw new Error(`Problem ${problem.seedKey} needs sample and hidden tests`)
      }

      const existing = await prisma.problem.findUnique({
        where: { seedKey: problem.seedKey },
        select: { id: true },
      })

      if (existing) {
        await prisma.$transaction(async (tx) => {
          await tx.testCase.deleteMany({ where: { problemId: existing.id } })
          await tx.problem.update({
            where: { id: existing.id },
            data: {
              authorId: author.id,
              title: problem.title,
              statement: problem.statement,
              difficulty: problem.difficulty,
              timeLimitMs: problem.timeLimitMs ?? 2000,
              memoryLimitMb: problem.memoryLimitMb ?? 256,
              starterPython: problem.starterPython ?? defaultStarters.python,
              starterJs: problem.starterJs ?? defaultStarters.js,
              starterCpp: null,
              visibility: "PUBLIC",
              reviewNote: null,
              tags,
              testCases: {
                create: testCases,
              },
            },
          })
        })
      } else {
        await prisma.problem.create({
          data: {
            authorId: author.id,
            seedKey: problem.seedKey,
            title: problem.title,
            statement: problem.statement,
            difficulty: problem.difficulty,
            timeLimitMs: problem.timeLimitMs ?? 2000,
            memoryLimitMb: problem.memoryLimitMb ?? 256,
            starterPython: problem.starterPython ?? defaultStarters.python,
            starterJs: problem.starterJs ?? defaultStarters.js,
            starterCpp: null,
            visibility: "PUBLIC",
            reviewNote: null,
            tags,
            testCases: {
              create: testCases,
            },
          },
        })
      }

      upserted += 1
      if (upserted % 20 === 0) {
        console.log(`  … ${upserted}/${catalogProblems.length}`)
      }
    }

    console.log(`Done. Upserted ${upserted} public catalog problems.`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
