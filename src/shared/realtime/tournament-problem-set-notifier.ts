import type { TournamentProblemDto } from "../../application/dto/problem.dto.js"

export type TournamentProblemSetUpdateDto = {
  tournamentId: string
  problems: TournamentProblemDto[]
}

export type TournamentProblemSetNotifier = {
  notify: (update: TournamentProblemSetUpdateDto) => void
}

export function createTournamentProblemSetNotifier(): TournamentProblemSetNotifier {
  return { notify: () => {} }
}
