-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "ProductAudio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "handle" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT,
    "audioUrl" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "ProductAudio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductAudio_handle_key" ON "ProductAudio"("handle");
