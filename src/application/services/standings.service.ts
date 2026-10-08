import type { ITournamentProblemRepository } from "../../domain/repositories/tournament-problem.repository.js"
import type { ITournamentSubmissionRepository } from "../../domain/repositories/tournament-submission.repository.js"
import type { ITournamentRepository } from "../../domain/repositories/tournament.repository.js"
import type { ILobbyRepository } from "../../domain/repositories/lobby.repository.js"
import type { TournamentStandingsDto } from "../dto/standings.dto.js"
import { computeStandings, rankStandingsEntries } from "../../shared/contest/compute-standings.js"
import { NotFoundError } from "../../shared/errors/app-error.js"

export class StandingsService {
  constructor(
    private readonly tournamentRepository: ITournamentRepository,
    private readonly tournamentProblemRepository: ITournamentProblemRepository,
    private readonly tournamentSubmissionRepository: ITournamentSubmissionRepository,
    private readonly lobbyRepository: ILobbyRepository,
  ) {}

  async getStandings(tournamentId: string): Promise<TournamentStandingsDto> {
    const tournament = await this.tournamentRepository.findByIdWithHost(tournamentId)
    if (!tournament) {
      throw new NotFoundError("Tournament not found")
    }

    if (tournament.status !== "LIVE" && tournament.status !== "ENDED") {
      return {
        tournamentId,
        updatedAt: new Date().toISOString(),
        entries: [],
      }
    }

    const ranked = await this.getRankedStandings(tournamentId)

    return {
      tournamentId,
      updatedAt: new Date().toISOString(),
      entries: ranked.map((entry) => ({
        rank: entry.rank,
        userId: entry.userId,
        displayName: entry.displayName,
        solved: entry.solved,
        penalty: entry.penalty,
        score: entry.score,
      })),
    }
  }

  async getRankedStandings(tournamentId: string) {
    const [lobby, problemEntries, submissions] = await Promise.all([
      this.lobbyRepository.findLobbyState(tournamentId),
      this.tournamentProblemRepository.findByTournamentId(tournamentId),
      this.tournamentSubmissionRepository.findByTournamentId(tournamentId),
    ])
    const players = (lobby?.players ?? []).filter((player) => player.role !== "host")
    const problemPoints = Object.fromEntries(
      problemEntries.map((entry) => [entry.problemId, entry.points]),
    )

    const computed = computeStandings(
      players.map((player) => ({
        userId: player.id,
        displayName: player.displayName,
      })),
      problemPoints,
      submissions,
    )

    return rankStandingsEntries(computed.entries)
  }
}
