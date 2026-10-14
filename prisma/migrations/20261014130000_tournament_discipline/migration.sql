-- CreateEnum
CREATE TYPE "SuspensionRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "TournamentPlayer" ADD COLUMN     "disqualifiedAt" TIMESTAMP(3),
ADD COLUMN     "disqualifyReason" TEXT;

-- CreateTable
CREATE TABLE "TournamentWarning" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "issuedById" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentWarning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentSuspensionRequest" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "SuspensionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "decidedById" TEXT,
    "decisionNote" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentSuspensionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TournamentWarning_tournamentId_createdAt_idx" ON "TournamentWarning"("tournamentId", "createdAt");

-- CreateIndex
CREATE INDEX "TournamentSuspensionRequest_tournamentId_createdAt_idx" ON "TournamentSuspensionRequest"("tournamentId", "createdAt");

-- CreateIndex
CREATE INDEX "TournamentSuspensionRequest_tournamentId_playerId_status_idx" ON "TournamentSuspensionRequest"("tournamentId", "playerId", "status");

-- AddForeignKey
ALTER TABLE "TournamentWarning" ADD CONSTRAINT "TournamentWarning_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentWarning" ADD CONSTRAINT "TournamentWarning_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentWarning" ADD CONSTRAINT "TournamentWarning_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentSuspensionRequest" ADD CONSTRAINT "TournamentSuspensionRequest_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentSuspensionRequest" ADD CONSTRAINT "TournamentSuspensionRequest_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentSuspensionRequest" ADD CONSTRAINT "TournamentSuspensionRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentSuspensionRequest" ADD CONSTRAINT "TournamentSuspensionRequest_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Moderators no longer occupy player seats
DELETE FROM "TournamentPlayer" WHERE "role" = 'MOD';

UPDATE "Tournament" t
SET "playerCount" = (
    SELECT COUNT(*) FROM "TournamentPlayer" p WHERE p."tournamentId" = t."id"
);
