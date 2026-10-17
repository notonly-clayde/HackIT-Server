import assert from "node:assert/strict"
import { allEligiblePlayersAcceptedScore } from "./all-players-finished.js"

const player = (finished: boolean, dq = false) => ({
  role: "player" as const,
  disqualifiedAt: dq ? new Date() : null,
  finishedAt: finished ? new Date() : null,
})

assert.equal(allEligiblePlayersAcceptedScore([]), false)
assert.equal(allEligiblePlayersAcceptedScore([player(false)]), false)
assert.equal(allEligiblePlayersAcceptedScore([player(true)]), true)
assert.equal(
  allEligiblePlayersAcceptedScore([player(true), player(false)]),
  false,
)
assert.equal(
  allEligiblePlayersAcceptedScore([player(true), player(true, true)]),
  true,
)
assert.equal(
  allEligiblePlayersAcceptedScore([
    { role: "host", disqualifiedAt: null, finishedAt: null },
    player(true),
  ]),
  true,
)

console.log("all-players-finished.test.ts: ok")
