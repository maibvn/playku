/*
  Warnings:

  - A unique constraint covering the columns `[handle,userId]` on the table `ProductAudio` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ProductAudio_handle_key";

-- CreateIndex
CREATE UNIQUE INDEX "ProductAudio_handle_userId_key" ON "ProductAudio"("handle", "userId");
