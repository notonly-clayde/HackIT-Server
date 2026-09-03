-- CreateTable
CREATE TABLE "TournamentPlayerSession" (
    "tournamentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activeProblemId" TEXT,
    "language" TEXT NOT NULL DEFAULT 'python',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentPlayerSession_pkey" PRIMARY KEY ("tournamentId","userId")
);

-- CreateTable
CREATE TABLE "TournamentWorkspace" (
    "tournamentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "sourceCode" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentWorkspace_pkey" PRIMARY KEY ("tournamentId","userId","problemId")
);

-- AddForeignKey
ALTER TABLE "TournamentPlayerSession" ADD CONSTRAINT "TournamentPlayerSession_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentPlayerSession" ADD CONSTRAINT "TournamentPlayerSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentWorkspace" ADD CONSTRAINT "TournamentWorkspace_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentWorkspace" ADD CONSTRAINT "TournamentWorkspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentWorkspace" ADD CONSTRAINT "TournamentWorkspace_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
