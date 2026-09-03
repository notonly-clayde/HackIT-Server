-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "endedReason" TEXT;

-- AlterTable
ALTER TABLE "MatchSubmission" ADD COLUMN     "sourceCode" TEXT NOT NULL DEFAULT '';
