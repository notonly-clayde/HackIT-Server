-- CreateEnum
CREATE TYPE "TournamentEndReason" AS ENUM ('HOST', 'TIMER', 'ALL_PLAYERS_FINISHED');

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN "endReason" "TournamentEndReason";

-- AlterTable
ALTER TABLE "TournamentPlayer" ADD COLUMN "eloBefore" INTEGER,
ADD COLUMN "eloAfter" INTEGER;
