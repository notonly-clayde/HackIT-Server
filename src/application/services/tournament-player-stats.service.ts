import type { ITournamentRepository } from "../../domain/repositories/tournament.repository.js"
import type { IUserRepository } from "../../domain/repositories/user.repository.js"
import { computeTournamentEloAfter } from "../../shared/tournament/tournament-elo.js"
import { prisma } from "../../infrastructure/database/prisma.client.js"
import type { StandingsService } from "./standings.service.js"

export class TournamentPlayerStatsService {
  constructor(
    private readonly tournamentRepository: ITournamentRepository,
    private readonly userRepository: IUserRepository,
    private readonly standingsService: StandingsService,
  ) {}

  /** Idempotent: applies wins, match count, and tournament ELO once per ended contest. */
  async applyIfNeeded(tournamentId: string): Promise<void> {
    const tournament = await this.tournamentRepository.findByIdWithHost(tournamentId)
    if (!tournament || tournament.status !== "ENDED" || tournament.playerStatsAppliedAt) {
      return
    }

    const ranked = await this.standingsService.getRankedStandings(tournamentId)
    if (ranked.length === 0) {
      await this.markApplied(tournamentId)
      return
    }

    const eligible = ranked.filter((entry) => !entry.disqualified)
    const userIds = ranked.map((entry) => entry.userId)
    const users = await Promise.all(userIds.map((id) => this.userRepository.findById(id)))
    const field = users
      .filter((user): user is NonNullable<typeof user> => user !== null)
      .filter((user) => eligible.some((entry) => entry.userId === user.id))
      .map((user) => ({ userId: user.id, eloTournament: user.eloTournament }))

    const totalPlayers = eligible.length
    const winnerId = eligible.find((entry) => entry.rank === 1)?.userId ?? null

    const updates = ranked.flatMap((entry) => {
      const user = users.find((row) => row?.id === entry.userId)
      if (!user) return []

      const won = winnerId === user.id
      const eloBefore = user.eloTournament
      let eloAfter = user.eloTournament

      if (!entry.disqualified && totalPlayers > 0) {
        eloAfter = computeTournamentEloAfter(
          user.eloTournament,
          entry.rank,
          totalPlayers,
          field,
          user.id,
        )
      }

      return [
        {
          userId: user.id,
          eloBefore: entry.disqualified ? null : eloBefore,
          eloAfter: entry.disqualified ? null : eloAfter,
          eloTournament: eloAfter,
          wins: won ? user.wins + 1 : user.wins,
          matchCount: user.matchCount + 1,
        },
      ]
    })

    await prisma.$transaction(async (tx) => {
      const row = await tx.tournament.findUnique({
        where: { id: tournamentId },
        select: { status: true, playerStatsAppliedAt: true },
      })
      if (!row || row.status !== "ENDED" || row.playerStatsAppliedAt) {
        return
      }

      for (const update of updates) {
        await tx.user.update({
          where: { id: update.userId },
          data: {
            eloTournament: update.eloTournament,
            wins: update.wins,
            matchCount: update.matchCount,
          },
        })

        await tx.tournamentPlayer.update({
          where: {
            tournamentId_userId: { tournamentId, userId: update.userId },
          },
          data: {
            eloBefore: update.eloBefore,
            eloAfter: update.eloAfter,
          },
        })
      }

      await tx.tournament.update({
        where: { id: tournamentId },
        data: { playerStatsAppliedAt: new Date() },
      })
    })
  }

  private async markApplied(tournamentId: string): Promise<void> {
    await prisma.tournament.updateMany({
      where: { id: tournamentId, playerStatsAppliedAt: null, status: "ENDED" },
      data: { playerStatsAppliedAt: new Date() },
    })
  }
}
