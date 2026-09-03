-- Remove host rows from player table (host manages, does not play)
DELETE FROM "TournamentPlayer" WHERE "role" = 'HOST';

-- Recalculate player counts excluding any remaining host rows
UPDATE "Tournament" t
SET "playerCount" = (
  SELECT COUNT(*)::int
  FROM "TournamentPlayer" tp
  WHERE tp."tournamentId" = t."id" AND tp."role" != 'HOST'
);

ALTER TABLE "Tournament" ADD COLUMN "liveStartedAt" TIMESTAMP(3);
ALTER TABLE "Tournament" ADD COLUMN "pausedAt" TIMESTAMP(3);
ALTER TABLE "Tournament" ADD COLUMN "pausedTotalMs" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Tournament" ADD COLUMN "endedAt" TIMESTAMP(3);
