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

    const lobby = await this.lobbyRepository.findLobbyState(tournamentId)
    const players = (lobby?.players ?? []).filter((player) => player.role !== "host")

    const problemEntries = await this.tournamentProblemRepository.findByTournamentId(tournamentId)
    const problemPoints = Object.fromEntries(
      problemEntries.map((entry) => [entry.problemId, entry.points]),
    )

    const submissions = await this.tournamentSubmissionRepository.findByTournamentId(tournamentId)

    const computed = computeStandings(
      players.map((player) => ({
        userId: player.id,
        displayName: player.displayName,
      })),
      problemPoints,
      submissions,
    )

    const ranked = rankStandingsEntries(computed.entries)

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
}
