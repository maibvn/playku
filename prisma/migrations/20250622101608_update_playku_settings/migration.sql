-- CreateTable
CREATE TABLE "PlaykuSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "playerHeight" INTEGER NOT NULL,
    "playerBgColor" TEXT NOT NULL,
    "iconColor" TEXT NOT NULL,
    "waveColor" TEXT NOT NULL,
    "progressColor" TEXT NOT NULL,
    "waveformHeight" INTEGER NOT NULL,
    "waveformBarWidth" INTEGER NOT NULL,
    "playPauseIcons" TEXT NOT NULL,
    "nextPrevIcons" TEXT NOT NULL,
    "closeIcon" TEXT NOT NULL,
    "autoLoop" BOOLEAN NOT NULL DEFAULT true,
    "showPlayIconOnImage" BOOLEAN NOT NULL DEFAULT true,
    "showWaveform" BOOLEAN NOT NULL DEFAULT true,
    "showTitle" BOOLEAN NOT NULL DEFAULT true,
    "showImage" BOOLEAN NOT NULL DEFAULT true
);
