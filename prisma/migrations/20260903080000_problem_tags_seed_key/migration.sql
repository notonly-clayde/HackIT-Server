-- AlterTable
ALTER TABLE "Problem" ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Problem" ADD COLUMN "seedKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Problem_seedKey_key" ON "Problem"("seedKey");

-- CreateIndex
CREATE INDEX "Problem_tags_idx" ON "Problem" USING GIN ("tags");
