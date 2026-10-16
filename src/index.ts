import dns from "node:dns"

import { createServer } from "node:http"

import "dotenv/config"

import { createApp } from "./app.js"

import { createContainer } from "./config/container.js"

import { loadEnv } from "./config/env.js"

import { createLobbyGateway } from "./infrastructure/realtime/lobby.gateway.js"

import { createVersusGateway } from "./infrastructure/realtime/versus.gateway.js"
import { pythonRuntime } from "./infrastructure/judge/python-runtime.js"

import { createTournamentProblemSetNotifier } from "./shared/realtime/tournament-problem-set-notifier.js"
import { createTournamentCatalogNotifier } from "./shared/realtime/tournament-catalog-notifier.js"
import { createTournamentLiveStateNotifier } from "./shared/realtime/tournament-live-state-notifier.js"
import { createTournamentStandingsNotifier } from "./shared/realtime/tournament-standings-notifier.js"
import { createTournamentWorkspaceNotifier } from "./shared/realtime/tournament-workspace-notifier.js"
import { createVersusMatchNotifier } from "./shared/realtime/versus-match-notifier.js"
import { createTournamentDisciplineNotifier } from "./shared/realtime/tournament-discipline-notifier.js"
import { createModeratorInviteNotifier } from "./shared/realtime/moderator-invite-notifier.js"



dns.setDefaultResultOrder("ipv4first")



const env = loadEnv()

const tournamentLiveStateNotifier = createTournamentLiveStateNotifier()
const tournamentStandingsNotifier = createTournamentStandingsNotifier()
const tournamentWorkspaceNotifier = createTournamentWorkspaceNotifier()
const tournamentCatalogNotifier = createTournamentCatalogNotifier()
const tournamentProblemSetNotifier = createTournamentProblemSetNotifier()
const versusMatchNotifier = createVersusMatchNotifier()
const tournamentDisciplineNotifier = createTournamentDisciplineNotifier()
const moderatorInviteNotifier = createModeratorInviteNotifier()

const container = createContainer(env, {
  tournamentDisciplineNotifier,
  moderatorInviteNotifier,
  tournamentLiveStateNotifier,
  tournamentStandingsNotifier,
  tournamentWorkspaceNotifier,
  tournamentCatalogNotifier,
  tournamentProblemSetNotifier,
  versusMatchNotifier,
})

const app = createApp(env, container)

const httpServer = createServer(app)



const gateway = createLobbyGateway(

  httpServer,

  env,

  container.jwtVerifier,

  container.userRepository,

  container.lobbyService,

  container.tournamentLiveService,

  container.tournamentRepository,

  container.integrityService,

)

const versusGateway = createVersusGateway(
  httpServer,
  env,
  container.jwtVerifier,
  container.userRepository,
  container.versusService,
  container.integrityService,
)

versusGateway.attach(gateway.io)



tournamentLiveStateNotifier.notify = gateway.notifyTournamentLiveState
tournamentStandingsNotifier.notify = gateway.notifyTournamentStandings
tournamentWorkspaceNotifier.notify = gateway.notifyTournamentWorkspaceUpdate
tournamentCatalogNotifier.notify = gateway.notifyTournamentCatalogUpdate
tournamentProblemSetNotifier.notify = gateway.notifyTournamentProblemSetUpdate
tournamentDisciplineNotifier.notifyWarned = gateway.notifyPlayerWarned
tournamentDisciplineNotifier.notifyDisqualified = gateway.notifyPlayerDisqualified
tournamentDisciplineNotifier.notifyUpdated = gateway.notifyDisciplineUpdated
moderatorInviteNotifier.notifyInvite = gateway.notifyModeratorInvite
moderatorInviteNotifier.notifyResolved = gateway.notifyModeratorInviteResolved
versusMatchNotifier.notifyState = versusGateway.notifyState
versusMatchNotifier.notifyStarted = versusGateway.notifyStarted
versusMatchNotifier.notifyEnded = versusGateway.notifyEnded
versusMatchNotifier.notifyLobbyReady = versusGateway.notifyLobbyReady



void container.tournamentLiveController.recoverLiveTournaments()
void container.versusController.recoverActiveMatches()
void pythonRuntime.warm()



httpServer.listen(env.PORT, () => {

  console.log(`HackIT server listening on http://localhost:${env.PORT}`)

})
