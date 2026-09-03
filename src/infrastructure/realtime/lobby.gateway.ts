import type { Server as HttpServer } from "node:http"

import { Server, type Socket } from "socket.io"

import type { Env } from "../../config/env.js"

import type { LobbyService } from "../../application/services/lobby.service.js"

import { toLobbyStateDto } from "../../application/mappers/lobby.mapper.js"

import type { JwtVerifier } from "../auth/jwt-verifier.js"

import type { IUserRepository } from "../../domain/repositories/user.repository.js"

import { isUserEmailVerified, resolveEmailVerified } from "../../shared/auth/email-verified.js"

import { AppError } from "../../shared/errors/app-error.js"

import type { TournamentLiveStateDto } from "../../shared/realtime/tournament-live-state-notifier.js"
import type { TournamentStandingsDto } from "../../shared/realtime/tournament-standings-notifier.js"
import type { TournamentWorkspaceUpdateDto } from "../../shared/realtime/tournament-workspace-notifier.js"
import type { TournamentCatalogUpdateDto } from "../../shared/realtime/tournament-catalog-notifier.js"
import type { TournamentProblemSetUpdateDto } from "../../shared/realtime/tournament-problem-set-notifier.js"
import type { TournamentLiveService } from "../../application/services/tournament-live.service.js"
import type { ITournamentRepository } from "../../domain/repositories/tournament.repository.js"



const RECONNECT_GRACE_MS = 8000



type AuthenticatedSocket = Socket & {

  data: {

    userId: string

    emailVerified: boolean

    tournamentId?: string

    watchOnly?: boolean

  }

}



type PendingLeave = {

  tournamentId: string

  userId: string

  timer: NodeJS.Timeout

}



export type LobbyGateway = {

  io: Server

  notifyTournamentLiveState: (state: TournamentLiveStateDto) => void

  notifyTournamentStandings: (standings: TournamentStandingsDto) => void

  notifyTournamentWorkspaceUpdate: (update: TournamentWorkspaceUpdateDto) => void

  notifyTournamentCatalogUpdate: (update: TournamentCatalogUpdateDto) => void

  notifyTournamentProblemSetUpdate: (update: TournamentProblemSetUpdateDto) => void

}



export function createLobbyGateway(

  httpServer: HttpServer,

  env: Env,

  jwtVerifier: JwtVerifier,

  userRepository: IUserRepository,

  lobbyService: LobbyService,

  tournamentLiveService: TournamentLiveService,

  tournamentRepository: ITournamentRepository,

): LobbyGateway {

  const io = new Server(httpServer, {

    cors: {

      origin: env.CORS_ORIGIN,

      credentials: true,

    },

  })



  const pendingLeaves = new Map<string, PendingLeave>()

  const socketTournament = new Map<string, string>()



  function pendingKey(tournamentId: string, userId: string) {

    return `${tournamentId}:${userId}`

  }



  function cancelPendingLeave(tournamentId: string, userId: string) {

    const key = pendingKey(tournamentId, userId)

    const pending = pendingLeaves.get(key)



    if (pending) {

      clearTimeout(pending.timer)

      pendingLeaves.delete(key)

    }

  }



  function broadcastCount(tournamentId: string, playerCount: number, maxPlayers: number) {

    io.to("lobby-index").emit("lobby:count", {

      tournamentId,

      playerCount,

      maxPlayers,

    })

  }



  function broadcastLobbyState(tournamentId: string, state: ReturnType<typeof toLobbyStateDto>) {

    io.to(`lobby:${tournamentId}`).emit("lobby:state", state)

  }



  async function handleLeave(tournamentId: string, userId: string, socket?: AuthenticatedSocket) {

    cancelPendingLeave(tournamentId, userId)



    const state = await lobbyService.leave(tournamentId, userId)



    if (state) {

      const dto = toLobbyStateDto(state)

      broadcastLobbyState(tournamentId, dto)

      broadcastCount(tournamentId, dto.playerCount, dto.maxPlayers)

    }



    if (socket) {

      socket.leave(`lobby:${tournamentId}`)

      delete socket.data.tournamentId

      delete socket.data.watchOnly

      socketTournament.delete(socket.id)

    }

  }



  io.use(async (socket, next) => {

    try {

      const token =

        typeof socket.handshake.auth.token === "string" ? socket.handshake.auth.token.trim() : ""



      if (!token) {

        return next(new Error("Missing auth token"))

      }



      const claims = await jwtVerifier.verify(token)

      const user = await userRepository.findById(claims.userId)



      if (!user) {

        return next(new Error("User profile not found"))

      }



      if (user.status === "SUSPENDED") {

        return next(new Error("Account suspended"))

      }



      if (!isUserEmailVerified(user)) {

        return next(new Error("Verified email required"))

      }



      const authSocket = socket as AuthenticatedSocket

      authSocket.data.userId = claims.userId

      authSocket.data.emailVerified = resolveEmailVerified(claims.emailVerified, user.emailVerified, user.role)

      next()

    } catch {

      next(new Error("Invalid or expired token"))

    }

  })



  io.on("connection", (socket) => {

    const authSocket = socket as AuthenticatedSocket



    authSocket.on("lobby:watch-index", () => {

      authSocket.join("lobby-index")

    })



    authSocket.on("lobby:unwatch-index", () => {

      authSocket.leave("lobby-index")

    })



    authSocket.on("lobby:watch", async (payload, ack) => {

      try {

        const tournamentId =

          payload && typeof payload.tournamentId === "string" ? payload.tournamentId.trim() : ""



        if (!tournamentId) {

          throw new AppError("Invalid tournament id", 400)

        }



        const previousTournamentId = authSocket.data.tournamentId



        if (previousTournamentId && previousTournamentId !== tournamentId && !authSocket.data.watchOnly) {

          await handleLeave(previousTournamentId, authSocket.data.userId)

        }



        authSocket.join(`lobby:${tournamentId}`)

        authSocket.data.tournamentId = tournamentId

        authSocket.data.watchOnly = true

        socketTournament.set(authSocket.id, tournamentId)



        const state = await lobbyService.getLobbyState(tournamentId)

        const dto = toLobbyStateDto(state)



        if (typeof ack === "function") {

          ack({ ok: true, state: dto })

        } else {

          authSocket.emit("lobby:state", dto)

        }

      } catch (error) {

        const message = error instanceof AppError ? error.message : "Failed to watch lobby"



        authSocket.emit("lobby:error", { message })



        if (typeof ack === "function") {

          ack({ ok: false, error: message })

        }

      }

    })



    authSocket.on("tournament:watch", (payload) => {

      const tournamentId =

        payload && typeof payload.tournamentId === "string" ? payload.tournamentId.trim() : ""



      if (!tournamentId) return



      authSocket.join(`tournament:${tournamentId}`)

    })



    authSocket.on("tournament:unwatch", (payload) => {

      const tournamentId =

        payload && typeof payload.tournamentId === "string" ? payload.tournamentId.trim() : ""



      if (!tournamentId) return



      authSocket.leave(`tournament:${tournamentId}`)

    })



    authSocket.on("tournament:host-watch", async (payload) => {

      const tournamentId =

        payload && typeof payload.tournamentId === "string" ? payload.tournamentId.trim() : ""



      if (!tournamentId) return



      try {

        const tournament = await tournamentRepository.findByIdWithHost(tournamentId)

        if (!tournament) return



        const role = await tournamentLiveService.resolveViewerRole(tournament, authSocket.data.userId)

        if (role !== "host" && role !== "mod") return



        authSocket.join(`tournament-host:${tournamentId}`)

      } catch {

        // ignore unauthorized host watch attempts

      }

    })



    authSocket.on("tournament:host-unwatch", (payload) => {

      const tournamentId =

        payload && typeof payload.tournamentId === "string" ? payload.tournamentId.trim() : ""



      if (!tournamentId) return



      authSocket.leave(`tournament-host:${tournamentId}`)

    })



    authSocket.on("lobby:join", async (payload, ack) => {

      try {

        const tournamentId =

          payload && typeof payload.tournamentId === "string" ? payload.tournamentId.trim() : ""



        if (!tournamentId) {

          throw new AppError("Invalid tournament id", 400)

        }



        const password =

          payload && typeof payload.password === "string" ? payload.password : undefined



        cancelPendingLeave(tournamentId, authSocket.data.userId)



        const previousTournamentId = authSocket.data.tournamentId



        if (previousTournamentId && previousTournamentId !== tournamentId) {

          if (authSocket.data.watchOnly) {

            authSocket.leave(`lobby:${previousTournamentId}`)

            delete authSocket.data.tournamentId

            delete authSocket.data.watchOnly

          } else {

            await handleLeave(previousTournamentId, authSocket.data.userId)

          }

        }



        const state = await lobbyService.join(

          tournamentId,

          authSocket.data.userId,

          authSocket.data.emailVerified,

          password,

        )



        const dto = toLobbyStateDto(state)



        authSocket.join(`lobby:${tournamentId}`)

        authSocket.data.tournamentId = tournamentId

        authSocket.data.watchOnly = false

        socketTournament.set(authSocket.id, tournamentId)



        broadcastLobbyState(tournamentId, dto)

        broadcastCount(tournamentId, dto.playerCount, dto.maxPlayers)



        if (typeof ack === "function") {

          ack({ ok: true, state: dto })

        } else {

          authSocket.emit("lobby:state", dto)

        }

      } catch (error) {

        const message = error instanceof AppError ? error.message : "Failed to join lobby"



        authSocket.emit("lobby:error", { message })



        if (typeof ack === "function") {

          ack({ ok: false, error: message })

        }

      }

    })



    authSocket.on("lobby:reconnect", async (payload, ack) => {
      try {
        const tournamentId =
          payload && typeof payload.tournamentId === "string" ? payload.tournamentId.trim() : ""

        if (!tournamentId) {
          throw new AppError("Invalid tournament id", 400)
        }

        cancelPendingLeave(tournamentId, authSocket.data.userId)

        const state = await lobbyService.reconnectLive(tournamentId, authSocket.data.userId)
        const dto = toLobbyStateDto(state)

        authSocket.join(`lobby:${tournamentId}`)
        authSocket.data.tournamentId = tournamentId
        authSocket.data.watchOnly = false
        socketTournament.set(authSocket.id, tournamentId)

        if (typeof ack === "function") {
          ack({ ok: true, state: dto })
        } else {
          authSocket.emit("lobby:state", dto)
        }
      } catch (error) {
        const message = error instanceof AppError ? error.message : "Failed to reconnect lobby"

        authSocket.emit("lobby:error", { message })

        if (typeof ack === "function") {
          ack({ ok: false, error: message })
        }
      }
    })

    authSocket.on("lobby:leave", async (_payload, ack) => {

      try {

        const tournamentId = authSocket.data.tournamentId



        if (!tournamentId) {

          if (typeof ack === "function") ack({ ok: true })

          return

        }



        if (authSocket.data.watchOnly) {

          authSocket.leave(`lobby:${tournamentId}`)

          delete authSocket.data.tournamentId

          delete authSocket.data.watchOnly

          socketTournament.delete(authSocket.id)



          if (typeof ack === "function") {

            ack({ ok: true })

          }

          return

        }



        await handleLeave(tournamentId, authSocket.data.userId, authSocket)



        if (typeof ack === "function") {

          ack({ ok: true })

        }

      } catch (error) {

        const message = error instanceof AppError ? error.message : "Failed to leave lobby"



        authSocket.emit("lobby:error", { message })



        if (typeof ack === "function") {

          ack({ ok: false, error: message })

        }

      }

    })



    authSocket.on("disconnect", () => {
      const tournamentId = authSocket.data.tournamentId ?? socketTournament.get(authSocket.id)
      const userId = authSocket.data.userId

      socketTournament.delete(authSocket.id)

      if (!tournamentId || !userId || authSocket.data.watchOnly) return

      cancelPendingLeave(tournamentId, userId)

      void (async () => {
        const tournament = await tournamentRepository.findByIdWithHost(tournamentId)

        if (!tournament || tournament.status === "LIVE" || tournament.status === "ENDED") {
          return
        }

        const key = pendingKey(tournamentId, userId)

        const timer = setTimeout(() => {
          pendingLeaves.delete(key)
          void handleLeave(tournamentId, userId)
        }, RECONNECT_GRACE_MS)

        pendingLeaves.set(key, { tournamentId, userId, timer })
      })()
    })

  })



  function notifyTournamentLiveState(state: TournamentLiveStateDto) {

    io.to(`lobby:${state.tournamentId}`).emit("tournament:live-state", state)

    io.to(`tournament:${state.tournamentId}`).emit("tournament:live-state", state)

    io.to("lobby-index").emit("tournament:live-state", state)



    if (state.status === "Live") {

      io.to(`lobby:${state.tournamentId}`).emit("lobby:started", {

        tournamentId: state.tournamentId,

        status: "Live" as const,

      })

    }

  }



  function notifyTournamentStandings(standings: TournamentStandingsDto) {
    io.to(`lobby:${standings.tournamentId}`).emit("tournament:standings", standings)
    io.to(`tournament:${standings.tournamentId}`).emit("tournament:standings", standings)
  }

  function notifyTournamentWorkspaceUpdate(update: TournamentWorkspaceUpdateDto) {
    io.to(`tournament-host:${update.tournamentId}`).emit("tournament:workspace-update", update)
    io.to(`tournament:${update.tournamentId}`).emit("tournament:workspace-update", update)
  }

  function notifyTournamentCatalogUpdate(update: TournamentCatalogUpdateDto) {
    io.to("lobby-index").emit("tournament:catalog-update", update)

    if (update.action === "removed") {
      io.to(`lobby:${update.tournamentId}`).emit("tournament:catalog-update", update)
      io.to(`tournament:${update.tournamentId}`).emit("tournament:catalog-update", update)
      io.to(`tournament-host:${update.tournamentId}`).emit("tournament:catalog-update", update)
    }
  }

  function notifyTournamentProblemSetUpdate(update: TournamentProblemSetUpdateDto) {
    io.to(`lobby:${update.tournamentId}`).emit("tournament:problem-set-update", update)
    io.to(`tournament:${update.tournamentId}`).emit("tournament:problem-set-update", update)
  }

  return {
    io,
    notifyTournamentLiveState,
    notifyTournamentStandings,
    notifyTournamentWorkspaceUpdate,
    notifyTournamentCatalogUpdate,
    notifyTournamentProblemSetUpdate,
  }
}

