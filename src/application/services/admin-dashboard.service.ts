import type { IUserRepository } from "../../domain/repositories/user.repository.js"
import type { ITournamentRepository } from "../../domain/repositories/tournament.repository.js"
import type { IMatchRepository } from "../../domain/repositories/match.repository.js"
import type { IReportRepository } from "../../domain/repositories/report.repository.js"

export type AdminDashboardSummary = {
  totalUsers: number
  activeTournaments: number
  openReports: number
  activeMatches: number
}

export class AdminDashboardService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tournamentRepository: ITournamentRepository,
    private readonly matchRepository: IMatchRepository,
    private readonly reportRepository: IReportRepository,
  ) {}

  async getSummary(): Promise<AdminDashboardSummary> {
    const [totalUsers, activeTournaments, openReports, activeMatches] = await Promise.all([
      this.userRepository.countAll(),
      this.tournamentRepository.countByStatus("LIVE"),
      this.reportRepository.countOpen(),
      this.matchRepository.countByStatus("LIVE"),
    ])

    return { totalUsers, activeTournaments, openReports, activeMatches }
  }
}
