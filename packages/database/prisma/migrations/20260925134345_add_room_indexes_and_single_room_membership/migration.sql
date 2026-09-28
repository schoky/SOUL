/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `RoomMember` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Room_status_createdAt_idx" ON "Room"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Room_hostUserId_idx" ON "Room"("hostUserId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomMember_userId_key" ON "RoomMember"("userId");
