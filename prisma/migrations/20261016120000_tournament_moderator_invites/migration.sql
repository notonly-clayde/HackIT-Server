-- CreateEnum
CREATE TYPE "ModeratorInviteStatus" AS ENUM ('PENDING', 'DECLINED');

-- CreateTable
CREATE TABLE "TournamentModeratorInvite" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "status" "ModeratorInviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "TournamentModeratorInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TournamentModeratorInvite_userId_status_idx" ON "TournamentModeratorInvite"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentModeratorInvite_tournamentId_userId_key" ON "TournamentModeratorInvite"("tournamentId", "userId");

-- AddForeignKey
ALTER TABLE "TournamentModeratorInvite" ADD CONSTRAINT "TournamentModeratorInvite_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentModeratorInvite" ADD CONSTRAINT "TournamentModeratorInvite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentModeratorInvite" ADD CONSTRAINT "TournamentModeratorInvite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
