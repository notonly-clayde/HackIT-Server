-- CreateEnum
CREATE TYPE "MatchKind" AS ENUM ('RANKED', 'PRIVATE');

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "kind" "MatchKind" NOT NULL DEFAULT 'RANKED',
ADD COLUMN     "lobbyName" TEXT,
ADD COLUMN     "passwordHash" TEXT,
ALTER COLUMN "playerBId" DROP NOT NULL,
ALTER COLUMN "playerBEloBefore" DROP NOT NULL;
