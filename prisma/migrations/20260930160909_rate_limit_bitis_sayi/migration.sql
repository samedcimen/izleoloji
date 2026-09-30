/*
  Warnings:

  - You are about to alter the column `bitis` on the `RateLimit` table. The data in that column could be lost. The data in that column will be cast from `DateTime` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RateLimit" (
    "anahtar" TEXT NOT NULL PRIMARY KEY,
    "sayac" INTEGER NOT NULL DEFAULT 0,
    "bitis" INTEGER NOT NULL
);
INSERT INTO "new_RateLimit" ("anahtar", "bitis", "sayac") SELECT "anahtar", "bitis", "sayac" FROM "RateLimit";
DROP TABLE "RateLimit";
ALTER TABLE "new_RateLimit" RENAME TO "RateLimit";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
