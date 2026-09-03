import type { Server as HttpServer } from "node:http"
import type { Server, Socket } from "socket.io"
import type { Env } from "../../config/env.js"
import type { VersusService } from "../../application/services/versus.service.js"
import { VersusMatchmakingQueue } from "../../application/services/versus-matchmaking.queue.js"
import { toVersusMatchDto } from "../../application/mappers/versus.mapper.js"
import type { VersusMatchDto, VersusMatchEndedDto } from "../../application/dto/versus.dto.js"
import type { VersusStartedEvent } from "../../shared/realtime/versus-match-notifier.js"
import type { JwtVerifier } from "../auth/jwt-verifier.js"
import type { IUserRepository } from "../../domain/repositories/user.repository.js"
import { AppError } from "../../shared/errors/app-error.js"
import type { ProblemDifficulty } from "../../domain/entities/problem.entity.js"

const RECONNECT_GRACE_MS = 8000
const TICK_MS = 1000

type AuthenticatedSocket = Socket & {
  data: {
    userId: string
    emailVerified: boolean
  }
}

type PendingLeave = {
  userId: string
  timer: NodeJS.Timeout
}

const difficultyMap: Record<string, ProblemDifficulty> = {
  easy: "EASY",
  medium: "MEDIUM",
  hard: "HARD",
}

export type VersusGateway = {
  attach: (io: Server) => void
  notifyState: (match: VersusMatchDto) => void
  notifyStarted: (event: VersusStartedEvent) => void
  notifyEnded: (event: VersusMatchEndedDto) => void
}

export function createVersusGateway(
  _httpServer: HttpServer,
  _env: Env,
  jwtVerifier: JwtVerifier,
  userRepository: IUserRepository,
  versusService: VersusService,
): VersusGateway {
  let io: Server | null = null
  const queue = new VersusMatchmakingQueue()
  const pendingLeaves = new Map<string, PendingLeave>()
  const userSockets = new Map<string, Set<string>>()
  const rematchOffers = new Map<string, Set<string>>()
  const rematchPresent = new Map<string, Set<string>>()
  const drawOffers = new Map<string, string>()

  const emitToUser = (userId: string, event: string, payload: unknown) => {
    if (!io) return
    const sockets = userSockets.get(userId)
    if (!sockets) return
    for (const socketId of sockets) {
      io.to(socketId).emit(event, payload)
    }
  }

  const opponentIdOf = (match: VersusMatchDto, userId: string) =>
    match.playerA.id === userId ? match.playerB.id : match.playerA.id

  const notifyState = (match: VersusMatchDto) => {
    if (!io) return
    const playerId = match.youAre === "a" ? match.playerA.id : match.playerB.id
    const sockets = userSockets.get(playerId)
    if (!sockets) return
    for (const socketId of sockets) {
      io.to(socketId).emit("versus:state", match)
    }
  }

  const notifyStarted = (event: VersusStartedEvent) => {
    if (!io) return
    io.to(`versus:${event.matchId}`).emit("versus:started", event)
  }

  const notifyEnded = (event: VersusMatchEndedDto) => {
    if (!io) return
    drawOffers.delete(event.match.id)
    rematchOffers.delete(event.match.id)
    if (event.match.status === "ended") {
      const present = rematchPresent.get(event.match.id) ?? new Set<string>()
      for (const playerId of [event.match.playerA.id, event.match.playerB.id]) {
        if (userSockets.has(playerId)) present.add(playerId)
      }
      rematchPresent.set(event.match.id, present)
    } else {
      rematchPresent.delete(event.match.id)
    }
    const playerId = event.match.youAre === "a" ? event.match.playerA.id : event.match.playerB.id
    emitToUser(playerId, "versus:ended", event)
  }

  const attach = (server: Server) => {
    io = server

    // Auth already applied by lobby gateway on the same io — still safe to rely on socket.data.
    // Versus handlers are registered on connection alongside lobby ones.

    server.on("connection", (socket) => {
      const authSocket = socket as AuthenticatedSocket
      if (!authSocket.data?.userId) return

      const userId = authSocket.data.userId
      const sockets = userSockets.get(userId) ?? new Set<string>()
      sockets.add(authSocket.id)
      userSockets.set(userId, sockets)

      const pending = pendingLeaves.get(userId)
      if (pending) {
        clearTimeout(pending.timer)
        pendingLeaves.delete(userId)
      }

      authSocket.on("versus:queue", async (payload, ack) => {
        try {
          const difficultyKey =
            payload && typeof payload === "object" && typeof payload.difficulty === "string"
              ? payload.difficulty.toLowerCase()
              : ""
          const difficulty = difficultyMap[difficultyKey]
          if (!difficulty) {
            throw new AppError("Invalid difficulty", 400)
          }

          const user = await userRepository.findById(userId)
          if (!user) throw new AppError("User not found", 404)
          if (user.status === "SUSPENDED") throw new AppError("Account suspended", 403)

          await versusService.assertPoolHasProblems(difficulty)

          queue.enqueue({
            userId,
            socketId: authSocket.id,
            elo: user.elo1v1,
            difficulty,
            queuedAt: Date.now(),
          })

          if (typeof ack === "function") {
            ack({ ok: true })
          }
          authSocket.emit("versus:queued", { difficulty: difficultyKey })

          await tryPairDifficulty(difficulty)
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to join queue"
          authSocket.emit("versus:error", { error: message })
          if (typeof ack === "function") {
            ack({ ok: false, error: message })
          }
        }
      })

      authSocket.on("versus:cancel", (_payload, ack) => {
        queue.removeUser(userId)
        if (typeof ack === "function") {
          ack({ ok: true })
        }
      })

      authSocket.on("versus:watch", async (payload, ack) => {
        try {
          const matchId =
            payload && typeof payload === "object" && typeof payload.matchId === "string"
              ? payload.matchId
              : ""
          if (!matchId) throw new AppError("Invalid match id", 400)

          const match = await versusService.getMatch(matchId, userId)
          await authSocket.join(`versus:${matchId}`)
          if (match.status === "ended") {
            const present = rematchPresent.get(matchId) ?? new Set<string>()
            present.add(userId)
            rematchPresent.set(matchId, present)
          }
          if (typeof ack === "function") {
            ack({ ok: true, match })
          }
          authSocket.emit("versus:state", match)
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to watch match"
          authSocket.emit("versus:error", { error: message })
          if (typeof ack === "function") {
            ack({ ok: false, error: message })
          }
        }
      })

      authSocket.on("versus:rematch", async (payload, ack) => {
        try {
          const matchId =
            payload && typeof payload === "object" && typeof payload.matchId === "string"
              ? payload.matchId
              : ""
          if (!matchId) throw new AppError("Invalid match id", 400)

          const match = await versusService.getMatch(matchId, userId)
          if (match.status !== "ended") {
            throw new AppError("Rematch is only available after a finished match", 400)
          }

          const opponentId = opponentIdOf(match, userId)
          const present = rematchPresent.get(matchId) ?? new Set<string>()
          if (!present.has(opponentId)) {
            if (typeof ack === "function") ack({ ok: false, error: "Opponent left" })
            authSocket.emit("versus:rematch-unavailable", { matchId })
            return
          }

          const offers = rematchOffers.get(matchId) ?? new Set<string>()
          offers.add(userId)
          rematchOffers.set(matchId, offers)

          if (offers.has(userId) && offers.has(opponentId)) {
            rematchOffers.delete(matchId)
            rematchPresent.delete(matchId)
            const difficulty = difficultyMap[match.difficulty]
            if (!difficulty) throw new AppError("Invalid difficulty", 400)
            const created = await versusService.createLobbyMatch(match.playerA.id, match.playerB.id, difficulty)
            const room = `versus:${created.id}`
            for (const playerId of [created.playerAId, created.playerBId]) {
              const sockets = userSockets.get(playerId)
              if (!sockets || !io) continue
              for (const socketId of sockets) {
                const sock = io.sockets.sockets.get(socketId)
                if (sock) await sock.join(room)
              }
              emitToUser(playerId, "versus:match-found", toVersusMatchDto(created, playerId))
            }
            if (typeof ack === "function") ack({ ok: true, accepted: true })
            return
          }

          emitToUser(opponentId, "versus:rematch-offered", { matchId })
          if (typeof ack === "function") ack({ ok: true, accepted: false })
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to rematch"
          if (typeof ack === "function") ack({ ok: false, error: message })
        }
      })

      authSocket.on("versus:results-leave", (payload) => {
        const matchId =
          payload && typeof payload === "object" && typeof payload.matchId === "string"
            ? payload.matchId
            : ""
        if (!matchId) return
        const present = rematchPresent.get(matchId)
        if (!present?.has(userId)) return
        present.delete(userId)
        rematchOffers.get(matchId)?.delete(userId)
        for (const otherId of present) {
          emitToUser(otherId, "versus:rematch-unavailable", { matchId })
        }
        if (present.size === 0) rematchPresent.delete(matchId)
      })

      authSocket.on("versus:draw-offer", async (payload, ack) => {
        try {
          const matchId =
            payload && typeof payload === "object" && typeof payload.matchId === "string"
              ? payload.matchId
              : ""
          if (!matchId) throw new AppError("Invalid match id", 400)

          const match = await versusService.getMatch(matchId, userId)
          if (match.status !== "live") {
            throw new AppError("Draw can only be offered during a live match", 400)
          }
          if (drawOffers.has(matchId)) {
            throw new AppError("A draw offer is already pending", 400)
          }

          drawOffers.set(matchId, userId)
          const opponentId = opponentIdOf(match, userId)
          emitToUser(opponentId, "versus:draw-offered", { matchId, fromUserId: userId })
          if (typeof ack === "function") ack({ ok: true })
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to offer draw"
          if (typeof ack === "function") ack({ ok: false, error: message })
        }
      })

      authSocket.on("versus:draw-respond", async (payload, ack) => {
        try {
          const matchId =
            payload && typeof payload === "object" && typeof payload.matchId === "string"
              ? payload.matchId
              : ""
          const accept = Boolean(payload && typeof payload === "object" && payload.accept === true)
          if (!matchId) throw new AppError("Invalid match id", 400)

          const offererId = drawOffers.get(matchId)
          if (!offererId) {
            throw new AppError("No draw offer pending", 400)
          }

          const match = await versusService.getMatch(matchId, userId)
          const opponentId = opponentIdOf(match, userId)

          const isOffererCancel = userId === offererId && !accept
          const isOpponentRespond = userId !== offererId
          if (!isOffererCancel && !isOpponentRespond) {
            throw new AppError("You already offered this draw", 400)
          }

          drawOffers.delete(matchId)

          if (!accept) {
            const notifyId = isOffererCancel ? opponentId : offererId
            emitToUser(notifyId, "versus:draw-declined", { matchId })
            if (typeof ack === "function") ack({ ok: true, accepted: false })
            return
          }

          await versusService.agreeDraw(matchId, userId)
          if (typeof ack === "function") ack({ ok: true, accepted: true })
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to respond to draw"
          if (typeof ack === "function") ack({ ok: false, error: message })
        }
      })

      authSocket.on("disconnect", () => {
        const set = userSockets.get(userId)
        if (set) {
          set.delete(authSocket.id)
          if (set.size === 0) userSockets.delete(userId)
        }

        if (!userSockets.has(userId)) {
          for (const [matchId, present] of rematchPresent) {
            if (!present.has(userId)) continue
            present.delete(userId)
            rematchOffers.get(matchId)?.delete(userId)
            for (const otherId of present) {
              emitToUser(otherId, "versus:rematch-unavailable", { matchId })
            }
          }
          for (const [matchId, offererId] of drawOffers) {
            if (offererId !== userId) continue
            drawOffers.delete(matchId)
          }

          const queued = queue.get(userId)
          if (queued) {
            const timer = setTimeout(() => {
              pendingLeaves.delete(userId)
              if (!userSockets.has(userId)) {
                queue.removeUser(userId)
              }
            }, RECONNECT_GRACE_MS)
            pendingLeaves.set(userId, { userId, timer })
          }
        } else {
          // Update queue socket id to a remaining socket if still queued
          const entry = queue.get(userId)
          if (entry && entry.socketId === authSocket.id) {
            const remaining = userSockets.get(userId)
            const nextId = remaining ? [...remaining][0] : null
            if (nextId) {
              queue.enqueue({ ...entry, socketId: nextId })
            }
          }
        }
      })
    })

    setInterval(() => {
      void tick()
    }, TICK_MS)
  }

  async function tryPairDifficulty(difficulty: ProblemDifficulty) {
    if (!io) return

    // Keep pairing while possible
    for (;;) {
      const pair = queue.tryPair(difficulty)
      if (!pair) break

      try {
        const match = await versusService.createLobbyMatch(pair.a.userId, pair.b.userId, difficulty)
        const room = `versus:${match.id}`

        for (const entry of [pair.a, pair.b]) {
          const sockets = userSockets.get(entry.userId)
          if (sockets) {
            for (const socketId of sockets) {
              const sock = io.sockets.sockets.get(socketId)
              if (sock) await sock.join(room)
            }
          }
        }

        for (const entry of [pair.a, pair.b]) {
          const dto = toVersusMatchDto(match, entry.userId)
          const sockets = userSockets.get(entry.userId)
          if (!sockets) continue
          for (const socketId of sockets) {
            io.to(socketId).emit("versus:match-found", dto)
          }
        }
      } catch (error) {
        // Re-queue both players if match creation failed
        const message = error instanceof Error ? error.message : "Failed to create match"
        for (const entry of [pair.a, pair.b]) {
          const sockets = userSockets.get(entry.userId)
          if (!sockets) continue
          for (const socketId of sockets) {
            io.to(socketId).emit("versus:error", { error: message })
          }
        }
      }
    }
  }

  async function tick() {
    for (const difficulty of ["EASY", "MEDIUM", "HARD"] as ProblemDifficulty[]) {
      await tryPairDifficulty(difficulty)
    }
    try {
      await versusService.tickActiveMatches()
    } catch {
      // ignore tick errors
    }
  }

  // Auth is handled by the shared Socket.IO middleware in the lobby gateway.
  void jwtVerifier

  return {
    attach,
    notifyState,
    notifyStarted,
    notifyEnded,
  }
}
