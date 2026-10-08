import type { IMatchRepository } from "../../domain/repositories/match.repository.js"
import type { ITournamentRepository } from "../../domain/repositories/tournament.repository.js"
import type { IUserRepository } from "../../domain/repositories/user.repository.js"
import type {
  ProfileHistoryItemDto,
  ProfileHistoryKind,
  ProfileHistoryTournamentItemDto,
  ProfileHistoryVersusItemDto,
} from "../dto/user.dto.js"
import { toMatchHistoryItemDto } from "../mappers/versus.mapper.js"
import { NotFoundError } from "../../shared/errors/app-error.js"
import type { StandingsService } from "./standings.service.js"

const DEFAULT_HISTORY_LIMIT = 20
const MAX_HISTORY_LIMIT = 50

export class ProfileHistoryService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly matchRepository: IMatchRepository,
    private readonly tournamentRepository: ITournamentRepository,
    private readonly standingsService: StandingsService,
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

    const [versus, tournaments] = await Promise.all([
      kind === "tournament" ? [] : this.listVersus(userId, limit),
      kind === "versus" ? [] : this.listTournaments(userId, limit, viewerId !== userId),
    ])

    return [...versus, ...tournaments]
      .sort((a, b) => b.endedAt.localeCompare(a.endedAt))
      .slice(0, limit)
  }

  private async listVersus(userId: string, limit: number): Promise<ProfileHistoryVersusItemDto[]> {
    const matches = await this.matchRepository.findRecentEndedByUserId(userId, limit)
    return matches.map((match) => ({ kind: "versus", ...toMatchHistoryItemDto(match, userId) }))
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
        return {
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
      }),
    )

    return items.filter((item): item is ProfileHistoryTournamentItemDto => item !== null)
  }
}
