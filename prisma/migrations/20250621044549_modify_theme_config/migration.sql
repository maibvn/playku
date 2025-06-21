/*
  Warnings:

  - You are about to drop the column `userId` on the `ThemeConfig` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ThemeConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "theme" TEXT NOT NULL,
    "productImageSelectors" TEXT NOT NULL
);
INSERT INTO "new_ThemeConfig" ("id", "productImageSelectors", "theme") SELECT "id", "productImageSelectors", "theme" FROM "ThemeConfig";
DROP TABLE "ThemeConfig";
ALTER TABLE "new_ThemeConfig" RENAME TO "ThemeConfig";
CREATE UNIQUE INDEX "ThemeConfig_theme_key" ON "ThemeConfig"("theme");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
