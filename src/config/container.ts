import type { Env } from "./env.js"

import { prisma } from "../infrastructure/database/prisma.client.js"
import { PrismaUserRepository } from "../infrastructure/database/prisma-user.repository.js"
import { PrismaReportRepository } from "../infrastructure/database/prisma-report.repository.js"
import { PrismaActivityLogRepository } from "../infrastructure/database/prisma-activity-log.repository.js"
import { PrismaTournamentRepository } from "../infrastructure/database/prisma-tournament.repository.js"
import { PrismaLobbyRepository } from "../infrastructure/database/prisma-lobby.repository.js"
import { PrismaProblemRepository } from "../infrastructure/database/prisma-problem.repository.js"
import { PrismaTournamentProblemRepository } from "../infrastructure/database/prisma-tournament-problem.repository.js"
import { PrismaTournamentSubmissionRepository } from "../infrastructure/database/prisma-tournament-submission.repository.js"
import { PrismaTournamentWorkspaceRepository } from "../infrastructure/database/prisma-tournament-workspace.repository.js"
import { PrismaMatchRepository } from "../infrastructure/database/prisma-match.repository.js"

import { JwtVerifier } from "../infrastructure/auth/jwt-verifier.js"

import { AuthService } from "../application/services/auth.service.js"
import { UserService } from "../application/services/user.service.js"
import { TournamentService } from "../application/services/tournament.service.js"
import { LobbyService } from "../application/services/lobby.service.js"
import { ProblemService } from "../application/services/problem.service.js"
import { ReportService } from "../application/services/report.service.js"
import { AdminUserService } from "../application/services/admin-user.service.js"
import { ActivityLogService } from "../application/services/activity-log.service.js"
import { TournamentProblemService } from "../application/services/tournament-problem.service.js"
import { TournamentLiveService } from "../application/services/tournament-live.service.js"
import { SubmissionService } from "../application/services/submission.service.js"
import { StandingsService } from "../application/services/standings.service.js"
import { WorkspaceService } from "../application/services/workspace.service.js"
import { VersusService } from "../application/services/versus.service.js"
import { ProfileHistoryService } from "../application/services/profile-history.service.js"

import { AuthController } from "../presentation/controllers/auth.controller.js"
import { UserController } from "../presentation/controllers/user.controller.js"
import { TournamentController } from "../presentation/controllers/tournament.controller.js"
import { TournamentLiveController } from "../presentation/controllers/tournament-live.controller.js"
import { LobbyController } from "../presentation/controllers/lobby.controller.js"
import { ProblemController } from "../presentation/controllers/problem.controller.js"
import { TournamentProblemController } from "../presentation/controllers/tournament-problem.controller.js"
import { SubmissionController } from "../presentation/controllers/submission.controller.js"
import { StandingsController } from "../presentation/controllers/standings.controller.js"
import { WorkspaceController } from "../presentation/controllers/workspace.controller.js"
import { HealthController } from "../presentation/controllers/health.controller.js"
import { AdminUserController, ReportController } from "../presentation/controllers/moderation.controller.js"
import { ActivityLogController } from "../presentation/controllers/activity-log.controller.js"
import { VersusController } from "../presentation/controllers/versus.controller.js"

import { createAuthMiddleware } from "../presentation/middleware/auth.middleware.js"
import { createOptionalAuthMiddleware } from "../presentation/middleware/optional-auth.middleware.js"
import { createAdminMiddleware } from "../presentation/middleware/admin.middleware.js"

import { createTournamentLiveStateNotifier, type TournamentLiveStateNotifier } from "../shared/realtime/tournament-live-state-notifier.js"
import { createTournamentStandingsNotifier, type TournamentStandingsNotifier } from "../shared/realtime/tournament-standings-notifier.js"
import { createTournamentWorkspaceNotifier, type TournamentWorkspaceNotifier } from "../shared/realtime/tournament-workspace-notifier.js"
import { createTournamentCatalogNotifier, type TournamentCatalogNotifier } from "../shared/realtime/tournament-catalog-notifier.js"
import { createTournamentProblemSetNotifier, type TournamentProblemSetNotifier } from "../shared/realtime/tournament-problem-set-notifier.js"
import { createVersusMatchNotifier, type VersusMatchNotifier } from "../shared/realtime/versus-match-notifier.js"


export type ContainerDeps = {
  tournamentLiveStateNotifier?: TournamentLiveStateNotifier
  tournamentStandingsNotifier?: TournamentStandingsNotifier
  tournamentWorkspaceNotifier?: TournamentWorkspaceNotifier
  tournamentCatalogNotifier?: TournamentCatalogNotifier
  tournamentProblemSetNotifier?: TournamentProblemSetNotifier
  versusMatchNotifier?: VersusMatchNotifier
}

export type Container = {
  authMiddleware: ReturnType<typeof createAuthMiddleware>
  bootstrapAuthMiddleware: ReturnType<typeof createAuthMiddleware>
  optionalAuthMiddleware: ReturnType<typeof createOptionalAuthMiddleware>
  adminMiddleware: ReturnType<typeof createAdminMiddleware>
  authController: AuthController
  userController: UserController
  reportController: ReportController
  adminUserController: AdminUserController
  activityLogController: ActivityLogController
  tournamentController: TournamentController
  tournamentLiveController: TournamentLiveController
  lobbyController: LobbyController
  problemController: ProblemController
  tournamentProblemController: TournamentProblemController
  submissionController: SubmissionController
  standingsController: StandingsController
  workspaceController: WorkspaceController
  versusController: VersusController
  healthController: HealthController
  jwtVerifier: JwtVerifier
  userRepository: PrismaUserRepository
  lobbyService: LobbyService
  tournamentLiveService: TournamentLiveService
  tournamentRepository: PrismaTournamentRepository
  versusService: VersusService
}

export function createContainer(env: Env, deps: ContainerDeps = {}): Container {
  const tournamentLiveStateNotifier = deps.tournamentLiveStateNotifier ?? createTournamentLiveStateNotifier()
  const tournamentStandingsNotifier = deps.tournamentStandingsNotifier ?? createTournamentStandingsNotifier()
  const tournamentWorkspaceNotifier = deps.tournamentWorkspaceNotifier ?? createTournamentWorkspaceNotifier()
  const tournamentCatalogNotifier = deps.tournamentCatalogNotifier ?? createTournamentCatalogNotifier()
  const tournamentProblemSetNotifier = deps.tournamentProblemSetNotifier ?? createTournamentProblemSetNotifier()
  const versusMatchNotifier = deps.versusMatchNotifier ?? createVersusMatchNotifier()

  const userRepository = new PrismaUserRepository()
  const reportRepository = new PrismaReportRepository()
  const activityLogRepository = new PrismaActivityLogRepository()
  const tournamentRepository = new PrismaTournamentRepository()
  const lobbyRepository = new PrismaLobbyRepository()
  const problemRepository = new PrismaProblemRepository()
  const tournamentProblemRepository = new PrismaTournamentProblemRepository()
  const tournamentSubmissionRepository = new PrismaTournamentSubmissionRepository()
  const tournamentWorkspaceRepository = new PrismaTournamentWorkspaceRepository()
  const matchRepository = new PrismaMatchRepository()
  const jwtVerifier = new JwtVerifier(env.NEON_AUTH_URL)
  const activityLogService = new ActivityLogService(activityLogRepository)
  const authService = new AuthService(userRepository, env, activityLogService)
  const userService = new UserService(userRepository, activityLogService, matchRepository)
  const reportService = new ReportService(
    reportRepository,
    userRepository,
    tournamentRepository,
    problemRepository,
    activityLogService,
  )
  const adminUserService = new AdminUserService(userRepository, reportRepository, activityLogService)
  const tournamentService = new TournamentService(tournamentRepository, userRepository, activityLogService)
  const lobbyService = new LobbyService(lobbyRepository, userRepository, activityLogService)
  const problemService = new ProblemService(problemRepository, userRepository, activityLogService)
  const tournamentLiveService = new TournamentLiveService(
    tournamentRepository,
    tournamentProblemRepository,
    lobbyRepository,
    userRepository,
    activityLogService,
  )
  const tournamentProblemService = new TournamentProblemService(
    tournamentRepository,
    tournamentProblemRepository,
    problemRepository,
    problemService,
    userRepository,
    tournamentLiveService,
    lobbyRepository,
    tournamentProblemSetNotifier,
    activityLogService,
  )
  const standingsService = new StandingsService(
    tournamentRepository,
    tournamentProblemRepository,
    tournamentSubmissionRepository,
    lobbyRepository,
  )
  const profileHistoryService = new ProfileHistoryService(
    userRepository,
    matchRepository,
    tournamentRepository,
    standingsService,
  )
  const submissionService = new SubmissionService(
    problemRepository,
    tournamentRepository,
    tournamentProblemRepository,
    tournamentSubmissionRepository,
    tournamentLiveService,
    standingsService,
    tournamentStandingsNotifier,
    activityLogService,
  )
  const workspaceService = new WorkspaceService(
    tournamentRepository,
    tournamentProblemRepository,
    tournamentWorkspaceRepository,
    lobbyRepository,
    userRepository,
    tournamentLiveService,
    tournamentWorkspaceNotifier,
  )
  const versusService = new VersusService(
    matchRepository,
    problemRepository,
    userRepository,
    versusMatchNotifier,
  )


  return {
    authMiddleware: createAuthMiddleware(jwtVerifier, userRepository, env.ADMIN_EMAILS),
    bootstrapAuthMiddleware: createAuthMiddleware(jwtVerifier, userRepository, env.ADMIN_EMAILS, {
      allowSuspended: true,
    }),
    optionalAuthMiddleware: createOptionalAuthMiddleware(jwtVerifier, userRepository, env.ADMIN_EMAILS),
    adminMiddleware: createAdminMiddleware(userRepository),
    authController: new AuthController(authService, env.ADMIN_EMAILS),
    userController: new UserController(userService, profileHistoryService),
    reportController: new ReportController(reportService),
    adminUserController: new AdminUserController(adminUserService),
    activityLogController: new ActivityLogController(activityLogService),
    tournamentController: new TournamentController(
      tournamentService,
      tournamentLiveService,
      tournamentCatalogNotifier,
    ),
    tournamentLiveController: new TournamentLiveController(
      tournamentLiveService,
      tournamentLiveStateNotifier,
    ),
    lobbyController: new LobbyController(lobbyService),
    problemController: new ProblemController(problemService, userRepository),
    tournamentProblemController: new TournamentProblemController(tournamentProblemService),
    submissionController: new SubmissionController(submissionService, userRepository),
    standingsController: new StandingsController(standingsService, tournamentLiveService),
    workspaceController: new WorkspaceController(workspaceService),
    versusController: new VersusController(versusService),
    healthController: new HealthController(),
    jwtVerifier,
    userRepository,
    lobbyService,
    tournamentLiveService,
    tournamentRepository,
    versusService,
  }
}

export { prisma }