/**
 * Prisma's query engine still uses Postgres STARTTLS (SSLRequest).
 * This Neon endpoint requires TLS-first (`sslnegotiation=direct`) and
 * IPv4. This wrapper proxies 127.0.0.1 -> Neon over direct TLS so
 * `prisma migrate` / `prisma studio` can run.
 */
import dns from "node:dns"
import fs from "node:fs"
import net from "node:net"
import path from "node:path"
import tls from "node:tls"
import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"

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

const prismaArgs = process.argv.slice(2)
if (prismaArgs.length === 0) {
  console.error("Usage: node scripts/prisma-neon.mjs <prisma args>")
  process.exit(1)
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error("DATABASE_URL is not set")
  process.exit(1)
}

const target = new URL(databaseUrl)

function startProxy() {
  return new Promise((resolve, reject) => {
    const server = net.createServer((client) => {
      client.pause()
      const neon = tls.connect({
        host: target.hostname,
        port: Number(target.port || 5432),
        servername: target.hostname,
        family: 4,
        rejectUnauthorized: true,
        ALPNProtocols: ["postgresql"],
      })

      neon.setNoDelay(true)
      client.setNoDelay(true)

      const fail = (err) => {
        if (err) {
          console.error("Neon proxy:", err.message)
        }
        client.destroy()
        neon.destroy()
      }

      neon.on("error", fail)
      client.on("error", () => neon.destroy())
      client.on("close", () => neon.destroy())
      neon.on("close", () => client.destroy())
      neon.on("secureConnect", () => {
        client.pipe(neon)
        neon.pipe(client)
        client.resume()
      })
    })

    server.on("error", reject)
    server.listen(0, "127.0.0.1", () => {
      const address = server.address()
      if (!address || typeof address === "string") {
        reject(new Error("Failed to bind Neon TLS proxy"))
        return
      }
      resolve({ server, port: address.port })
    })
  })
}

const { server, port } = await startProxy()

const local = new URL(databaseUrl)
local.hostname = "127.0.0.1"
local.port = String(port)
local.search = "sslmode=disable"

const prismaEntry = path.join(root, "node_modules/prisma/build/index.js")
const child = spawn(process.execPath, [prismaEntry, ...prismaArgs], {
  cwd: root,
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: local.toString(),
  },
})

const shutdown = (code) => {
  server.close()
  process.exit(code ?? 1)
}

child.on("exit", shutdown)
child.on("error", (err) => {
  console.error(err)
  shutdown(1)
})
