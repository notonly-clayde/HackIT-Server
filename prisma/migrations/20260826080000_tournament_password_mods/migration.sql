-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN "passwordHash" TEXT;

-- CreateTable
CREATE TABLE "TournamentModerator" (
    "tournamentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TournamentModerator_pkey" PRIMARY KEY ("tournamentId","userId")
);

-- AddForeignKey
ALTER TABLE "TournamentModerator" ADD CONSTRAINT "TournamentModerator_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentModerator" ADD CONSTRAINT "TournamentModerator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
