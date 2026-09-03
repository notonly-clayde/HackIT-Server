import dns from "node:dns"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

dns.setDefaultResultOrder("ipv4first")

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrisma() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is required")
  }

  const adapter = new PrismaPg({
    connectionString,
    connectionTimeoutMillis: 15_000,
  })

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
