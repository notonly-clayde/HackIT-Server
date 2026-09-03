import type { TournamentItemDto } from "../../application/dto/tournament.dto.js"

export type TournamentCatalogUpdateDto =
  | { action: "created"; tournament: TournamentItemDto }
  | { action: "updated"; tournament: TournamentItemDto }
  | { action: "removed"; tournamentId: string }

export type TournamentCatalogNotifier = {
  notify: (update: TournamentCatalogUpdateDto) => void
}

export function createTournamentCatalogNotifier(): TournamentCatalogNotifier {
  return { notify: () => {} }
}
