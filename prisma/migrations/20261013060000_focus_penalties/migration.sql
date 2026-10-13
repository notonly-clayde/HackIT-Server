-- AlterTable
ALTER TABLE "TournamentPlayer" ADD COLUMN "focusPointDeduction" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Match" ADD COLUMN "playerAFocusEloPenalty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "playerBFocusEloPenalty" INTEGER NOT NULL DEFAULT 0;
