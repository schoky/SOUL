-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "state" JSONB;

-- CreateIndex
CREATE INDEX "Game_roomId_idx" ON "Game"("roomId");
