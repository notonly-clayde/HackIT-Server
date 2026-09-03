import type { ITournamentProblemRepository } from "../../domain/repositories/tournament-problem.repository.js"
import type { ITournamentRepository } from "../../domain/repositories/tournament.repository.js"
import type { ITournamentWorkspaceRepository } from "../../domain/repositories/tournament-workspace.repository.js"
import type { ILobbyRepository } from "../../domain/repositories/lobby.repository.js"
import type { IUserRepository } from "../../domain/repositories/user.repository.js"
import type { TournamentLiveService } from "./tournament-live.service.js"
import type {
  MyTournamentWorkspaceDto,
  PlayerWorkspaceViewDto,
  SaveMyWorkspaceDto,
  TournamentWorkspaceUpdateDto,
} from "../dto/workspace.dto.js"
import { BadRequestError, ForbiddenError, NotFoundError } from "../../shared/errors/app-error.js"
import { normalizeWorkspaceLanguage } from "../../domain/repositories/tournament-workspace.repository.js"
import type { TournamentWorkspaceNotifier } from "../../shared/realtime/tournament-workspace-notifier.js"

export class WorkspaceService {
  constructor(
    private readonly tournamentRepository: ITournamentRepository,
    private readonly tournamentProblemRepository: ITournamentProblemRepository,
    private readonly tournamentWorkspaceRepository: ITournamentWorkspaceRepository,
    private readonly lobbyRepository: ILobbyRepository,
    private readonly userRepository: IUserRepository,
    private readonly tournamentLiveService: TournamentLiveService,
    private readonly workspaceNotifier: TournamentWorkspaceNotifier,
  ) {}

  async getMyWorkspace(tournamentId: string, userId: string): Promise<MyTournamentWorkspaceDto> {
    await this.assertWorkspaceWriteAccess(tournamentId, userId)

    const session = await this.tournamentWorkspaceRepository.findSession(tournamentId, userId)
    const entries = await this.tournamentWorkspaceRepository.findEntries(tournamentId, userId)

    return {
      session: session
        ? {
            activeProblemId: session.activeProblemId,
            language: session.language,
            updatedAt: session.updatedAt.toISOString(),
          }
        : {
            activeProblemId: null,
            language: "python",
            updatedAt: new Date(0).toISOString(),
          },
      entries: entries.map((entry) => ({
        problemId: entry.problemId,
        sourceCode: entry.sourceCode,
        updatedAt: entry.updatedAt.toISOString(),
      })),
    }
  }

  async saveMyWorkspace(
    tournamentId: string,
    userId: string,
    input: SaveMyWorkspaceDto,
  ): Promise<MyTournamentWorkspaceDto> {
    await this.assertWorkspaceWriteAccess(tournamentId, userId)

    if (input.problemId) {
      await this.assertProblemInTournament(tournamentId, input.problemId)
    }

    if (input.activeProblemId) {
      await this.assertProblemInTournament(tournamentId, input.activeProblemId)
    }

    const { session, entry } = await this.tournamentWorkspaceRepository.saveMyWorkspace(
      tournamentId,
      userId,
      {
        problemId: input.problemId,
        sourceCode: input.sourceCode,
        activeProblemId: input.activeProblemId,
        language: input.language ? normalizeWorkspaceLanguage(input.language) : undefined,
      },
    )

    if (entry) {
      const user = await this.userRepository.findById(userId)
      const update: TournamentWorkspaceUpdateDto = {
        tournamentId,
        userId,
        displayName: user?.displayName ?? "Player",
        activeProblemId: session.activeProblemId,
        language: session.language,
        problemId: entry.problemId,
        sourceCode: entry.sourceCode,
        updatedAt: entry.updatedAt.toISOString(),
      }
      this.workspaceNotifier.notify(update)
    } else if (input.activeProblemId !== undefined || input.language !== undefined) {
      const user = await this.userRepository.findById(userId)
      const problemId = session.activeProblemId ?? input.problemId
      if (problemId) {
        const existing = await this.tournamentWorkspaceRepository.findEntry(
          tournamentId,
          userId,
          problemId,
        )
        const update: TournamentWorkspaceUpdateDto = {
          tournamentId,
          userId,
          displayName: user?.displayName ?? "Player",
          activeProblemId: session.activeProblemId,
          language: session.language,
          problemId,
          sourceCode: existing?.sourceCode ?? "",
          updatedAt: session.updatedAt.toISOString(),
        }
        this.workspaceNotifier.notify(update)
      }
    }

    return this.getMyWorkspace(tournamentId, userId)
  }

  async getPlayerWorkspace(
    tournamentId: string,
    viewerId: string,
    targetUserId: string,
    problemId?: string,
  ): Promise<PlayerWorkspaceViewDto> {
    await this.assertSpectateWorkspaceAccess(tournamentId, viewerId)

    const targetRole = await this.lobbyRepository.findParticipantRole(tournamentId, targetUserId)
    if (!targetRole) {
      throw new NotFoundError("Player not found in this tournament")
    }

    const user = await this.userRepository.findById(targetUserId)
    if (!user) {
      throw new NotFoundError("Player not found")
    }

    const session = await this.tournamentWorkspaceRepository.findSession(tournamentId, targetUserId)
    const resolvedProblemId = problemId ?? session?.activeProblemId

    if (!resolvedProblemId) {
      return {
        userId: targetUserId,
        displayName: user.displayName,
        session: {
          activeProblemId: session?.activeProblemId ?? null,
          language: session?.language ?? "python",
          updatedAt: (session?.updatedAt ?? new Date(0)).toISOString(),
        },
        problemId: "",
        sourceCode: "",
        updatedAt: (session?.updatedAt ?? new Date(0)).toISOString(),
      }
    }

    await this.assertProblemInTournament(tournamentId, resolvedProblemId)

    const entry = await this.tournamentWorkspaceRepository.findEntry(
      tournamentId,
      targetUserId,
      resolvedProblemId,
    )

    return {
      userId: targetUserId,
      displayName: user.displayName,
      session: {
        activeProblemId: session?.activeProblemId ?? resolvedProblemId,
        language: session?.language ?? "python",
        updatedAt: (session?.updatedAt ?? new Date(0)).toISOString(),
      },
      problemId: resolvedProblemId,
      sourceCode: entry?.sourceCode ?? "",
      updatedAt: (entry?.updatedAt ?? session?.updatedAt ?? new Date(0)).toISOString(),
    }
  }

  private async assertWorkspaceWriteAccess(tournamentId: string, userId: string) {
    const tournament = await this.tournamentRepository.findByIdWithHost(tournamentId)
    if (!tournament) {
      throw new NotFoundError("Tournament not found")
    }

    if (tournament.status !== "LIVE" && tournament.status !== "ENDED") {
      throw new ForbiddenError("Workspace is only available during live tournaments")
    }

    if (tournament.hostId === userId) {
      throw new ForbiddenError("Host cannot use the player workspace")
    }

    const role = await this.lobbyRepository.findParticipantRole(tournamentId, userId)
    if (!role) {
      throw new ForbiddenError("Only enrolled players can access the workspace")
    }
  }

  private async assertSpectateWorkspaceAccess(tournamentId: string, viewerId: string) {
    const tournament = await this.tournamentRepository.findByIdWithHost(tournamentId)
    if (!tournament) {
      throw new NotFoundError("Tournament not found")
    }

    const role = await this.tournamentLiveService.resolveViewerRole(tournament, viewerId)
    if (role === "host" || role === "mod") {
      return
    }

    if (tournament.status !== "LIVE" && tournament.status !== "ENDED") {
      throw new ForbiddenError("Player workspaces are only visible during live or ended tournaments")
    }
  }

  private async assertProblemInTournament(tournamentId: string, problemId: string) {
    const entries = await this.tournamentProblemRepository.findByTournamentId(tournamentId)
    if (!entries.some((entry) => entry.problemId === problemId)) {
      throw new BadRequestError("Problem is not attached to this tournament")
    }
  }
}
