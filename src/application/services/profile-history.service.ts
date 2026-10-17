import type { IMatchRepository } from "../../domain/repositories/match.repository.js"
import type { ITournamentRepository } from "../../domain/repositories/tournament.repository.js"
import type { IUserRepository } from "../../domain/repositories/user.repository.js"
import type {
  HostedLobbyItemDto,
  ProfileHistoryItemDto,
  ProfileHistoryKind,
  ProfileHistoryPrivateItemDto,
  ProfileHistoryTournamentItemDto,
  ProfileHistoryVersusItemDto,
} from "../dto/user.dto.js"
import { sortHostedLobbies } from "../utils/sort-hosted-lobbies.js"
import {
  profileMatchToHistoryRecord,
  toMatchHistoryItemDto,
  toPrivateHistoryItemDto,
  toPrivateHostedRoomItemDto,
} from "../mappers/versus.mapper.js"
import { toTournamentItemDto } from "../mappers/tournament.mapper.js"
import { ForbiddenError, NotFoundError } from "../../shared/errors/app-error.js"
import type { ILobbyRepository } from "../../domain/repositories/lobby.repository.js"
import type { StandingsService } from "./standings.service.js"

const DEFAULT_HISTORY_LIMIT = 20
const MAX_HISTORY_LIMIT = 50

export class ProfileHistoryService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly matchRepository: IMatchRepository,
    private readonly tournamentRepository: ITournamentRepository,
    private readonly standingsService: StandingsService,
    private readonly lobbyRepository: ILobbyRepository,
  ) {}

  async listHistory(
    userId: string,
    viewerId: string,
    kind: ProfileHistoryKind,
    rawLimit?: number,
  ): Promise<ProfileHistoryItemDto[]> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError("User not found")
    }

    const limit = Number.isFinite(rawLimit)
      ? Math.min(MAX_HISTORY_LIMIT, Math.max(1, Math.floor(rawLimit!)))
      : DEFAULT_HISTORY_LIMIT

    const [oneVsOne, tournaments] = await Promise.all([
      kind === "tournament" ? [] : this.listOneVsOneHistory(userId, limit),
      kind === "versus" ? [] : this.listTournaments(userId, limit, viewerId !== userId),
    ])

    return [...oneVsOne, ...tournaments]
      .sort((a, b) => b.endedAt.localeCompare(a.endedAt))
      .slice(0, limit)
  }

  async listHostedTournaments(
    userId: string,
    viewerId: string,
    rawLimit?: number,
  ): Promise<HostedLobbyItemDto[]> {
    if (userId !== viewerId) {
      throw new ForbiddenError("You can only view your own hosted tournaments")
    }

    const limit = Number.isFinite(rawLimit)
      ? Math.min(MAX_HISTORY_LIMIT, Math.max(1, Math.floor(rawLimit!)))
      : DEFAULT_HISTORY_LIMIT

    const [tournaments, privateRooms] = await Promise.all([
      this.tournamentRepository.findByHostId(userId),
      this.matchRepository.findPrivateHostedByHostId(userId),
    ])

    const items: HostedLobbyItemDto[] = [
      ...tournaments.map((tournament) => ({
        lobbyKind: "tournament" as const,
        ...toTournamentItemDto(tournament, "host"),
      })),
      ...privateRooms.map((room) => toPrivateHostedRoomItemDto(room)),
    ]

    return sortHostedLobbies(items).slice(0, limit)
  }

  private async listOneVsOneHistory(
    userId: string,
    limit: number,
  ): Promise<Array<ProfileHistoryVersusItemDto | ProfileHistoryPrivateItemDto>> {
    const matches = await this.matchRepository.findRecentProfileMatchesByUserId(userId, limit)
    const items: Array<ProfileHistoryVersusItemDto | ProfileHistoryPrivateItemDto> = []
    for (const match of matches) {
      if (match.status === "ABORTED" && match.kind === "PRIVATE") {
        items.push(toPrivateHistoryItemDto(match))
        continue
      }
      if (match.status !== "ENDED") {
        continue
      }
      const record = profileMatchToHistoryRecord(match)
      if (!record) continue
      items.push({ kind: "versus", ...toMatchHistoryItemDto(record, userId) })
    }
    return items
  }

  // Ranks are recomputed from submissions per tournament; persist end-of-contest snapshots if this gets slow.
  private async listTournaments(
    userId: string,
    limit: number,
    publicOnly: boolean,
  ): Promise<ProfileHistoryTournamentItemDto[]> {
    const participations = await this.tournamentRepository.findRecentEndedParticipationsByUserId(
      userId,
      limit,
      { publicOnly },
    )

    const items = await Promise.all(
      participations.map(async (tournament): Promise<ProfileHistoryTournamentItemDto | null> => {
        const standings = await this.standingsService.getRankedStandings(tournament.id)
        const entry = standings.find((row) => row.userId === userId)
        if (!entry) return null
        const participation = await this.lobbyRepository.findPlayer(tournament.id, userId)
        const item: ProfileHistoryTournamentItemDto = {
          kind: "tournament",
          tournamentId: tournament.id,
          name: tournament.name,
          tournamentType: tournament.type === "FREE_FOR_ALL" ? "ffa" : "1v1",
          endedAt: tournament.endedAt.toISOString(),
          rank: entry.rank,
          rankTotal: standings.length,
          solved: entry.solved,
          score: entry.score,
        }
        if (
          participation?.eloBefore != null &&
          participation.eloAfter != null &&
          !entry.disqualified
        ) {
          item.eloBefore = participation.eloBefore
          item.eloAfter = participation.eloAfter
          item.eloDelta = participation.eloAfter - participation.eloBefore
        }
        return item
      }),
    )

    return items.filter((item): item is ProfileHistoryTournamentItemDto => item !== null)
  }
}
