-- CreateEnum
CREATE TYPE "SubmissionVerdict" AS ENUM ('ACCEPTED', 'WRONG_ANSWER', 'RUNTIME_ERROR', 'TIMEOUT', 'COMPILE_ERROR', 'UNSUPPORTED');

-- CreateTable
CREATE TABLE "TournamentSubmission" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "verdict" "SubmissionVerdict" NOT NULL,
    "effectiveElapsedMinutes" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TournamentSubmission_tournamentId_submittedAt_idx" ON "TournamentSubmission"("tournamentId", "submittedAt");

-- CreateIndex
CREATE INDEX "TournamentSubmission_tournamentId_userId_idx" ON "TournamentSubmission"("tournamentId", "userId");

-- CreateIndex
CREATE INDEX "TournamentSubmission_tournamentId_problemId_userId_idx" ON "TournamentSubmission"("tournamentId", "problemId", "userId");

-- AddForeignKey
ALTER TABLE "TournamentSubmission" ADD CONSTRAINT "TournamentSubmission_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentSubmission" ADD CONSTRAINT "TournamentSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentSubmission" ADD CONSTRAINT "TournamentSubmission_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
