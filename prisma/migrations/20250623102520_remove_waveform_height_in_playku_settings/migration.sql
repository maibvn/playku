/*
  Warnings:

  - You are about to drop the column `waveformHeight` on the `PlaykuSettings` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlaykuSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "playerHeight" INTEGER NOT NULL,
    "playerBgColor" TEXT NOT NULL,
    "iconPosition" TEXT NOT NULL,
    "iconColor" TEXT NOT NULL,
    "waveColor" TEXT NOT NULL,
    "progressColor" TEXT NOT NULL,
    "waveformBarWidth" INTEGER NOT NULL,
    "playPauseIcons" TEXT NOT NULL,
    "nextPrevIcons" TEXT NOT NULL,
    "closeIcon" TEXT NOT NULL,
    "autoLoop" BOOLEAN NOT NULL DEFAULT true,
    "showPlayIconOnImage" BOOLEAN NOT NULL DEFAULT true,
    "showTitle" BOOLEAN NOT NULL DEFAULT true,
    "showImage" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_PlaykuSettings" ("autoLoop", "closeIcon", "iconColor", "iconPosition", "id", "nextPrevIcons", "playPauseIcons", "playerBgColor", "playerHeight", "progressColor", "shop", "showImage", "showPlayIconOnImage", "showTitle", "waveColor", "waveformBarWidth") SELECT "autoLoop", "closeIcon", "iconColor", "iconPosition", "id", "nextPrevIcons", "playPauseIcons", "playerBgColor", "playerHeight", "progressColor", "shop", "showImage", "showPlayIconOnImage", "showTitle", "waveColor", "waveformBarWidth" FROM "PlaykuSettings";
DROP TABLE "PlaykuSettings";
ALTER TABLE "new_PlaykuSettings" RENAME TO "PlaykuSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
