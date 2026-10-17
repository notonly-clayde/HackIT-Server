import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { computeTournamentEloAfter, tournamentPlacementScore } from "./tournament-elo.js"

describe("tournamentPlacementScore", () => {
  it("rewards all three when the field has exactly three players", () => {
    assert.equal(tournamentPlacementScore(1, 3), 1)
    assert.equal(tournamentPlacementScore(2, 3), 0.7)
    assert.equal(tournamentPlacementScore(3, 3), 0.4)
  })

  it("penalizes last place when more than three players", () => {
    assert.equal(tournamentPlacementScore(4, 5), null)
    assert.equal(tournamentPlacementScore(5, 5), 0)
  })
})

describe("computeTournamentEloAfter", () => {
  const field = [
    { userId: "a", eloTournament: 1200 },
    { userId: "b", eloTournament: 1200 },
  ]

  it("increases ELO for first place", () => {
    const next = computeTournamentEloAfter(1200, 1, 2, field, "a")
    assert.ok(next > 1200)
  })

  it("decreases ELO for last place in a larger field", () => {
    const largeField = [
      { userId: "a", eloTournament: 1200 },
      { userId: "b", eloTournament: 1200 },
      { userId: "c", eloTournament: 1200 },
      { userId: "d", eloTournament: 1200 },
    ]
    const next = computeTournamentEloAfter(1200, 4, 4, largeField, "d")
    assert.ok(next < 1200)
  })
})
