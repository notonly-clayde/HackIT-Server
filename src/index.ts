import dns from "node:dns"

import { createServer } from "node:http"

import "dotenv/config"

import { createApp } from "./app.js"

import { createContainer } from "./config/container.js"

import { loadEnv } from "./config/env.js"

import { createLobbyGateway } from "./infrastructure/realtime/lobby.gateway.js"

import { createVersusGateway } from "./infrastructure/realtime/versus.gateway.js"

import { createTournamentProblemSetNotifier } from "./shared/realtime/tournament-problem-set-notifier.js"
import { createTournamentCatalogNotifier } from "./shared/realtime/tournament-catalog-notifier.js"
import { createTournamentLiveStateNotifier } from "./shared/realtime/tournament-live-state-notifier.js"
import { createTournamentStandingsNotifier } from "./shared/realtime/tournament-standings-notifier.js"
import { createTournamentWorkspaceNotifier } from "./shared/realtime/tournament-workspace-notifier.js"
import { createVersusMatchNotifier } from "./shared/realtime/versus-match-notifier.js"



dns.setDefaultResultOrder("ipv4first")



const env = loadEnv()

const tournamentLiveStateNotifier = createTournamentLiveStateNotifier()
const tournamentStandingsNotifier = createTournamentStandingsNotifier()
const tournamentWorkspaceNotifier = createTournamentWorkspaceNotifier()
const tournamentCatalogNotifier = createTournamentCatalogNotifier()
const tournamentProblemSetNotifier = createTournamentProblemSetNotifier()
const versusMatchNotifier = createVersusMatchNotifier()

const container = createContainer(env, {
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

)

const versusGateway = createVersusGateway(
  httpServer,
  env,
  container.jwtVerifier,
  container.userRepository,
  container.versusService,
)

versusGateway.attach(gateway.io)



tournamentLiveStateNotifier.notify = gateway.notifyTournamentLiveState
tournamentStandingsNotifier.notify = gateway.notifyTournamentStandings
tournamentWorkspaceNotifier.notify = gateway.notifyTournamentWorkspaceUpdate
tournamentCatalogNotifier.notify = gateway.notifyTournamentCatalogUpdate
tournamentProblemSetNotifier.notify = gateway.notifyTournamentProblemSetUpdate
versusMatchNotifier.notifyState = versusGateway.notifyState
versusMatchNotifier.notifyStarted = versusGateway.notifyStarted
versusMatchNotifier.notifyEnded = versusGateway.notifyEnded
versusMatchNotifier.notifyLobbyReady = versusGateway.notifyLobbyReady



void container.tournamentLiveController.recoverLiveTournaments()
void container.versusController.recoverActiveMatches()



httpServer.listen(env.PORT, () => {

  console.log(`HackIT server listening on http://localhost:${env.PORT}`)

})
