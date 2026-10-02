-- CreateTable
CREATE TABLE "BolumKaydi" (
    "userId" TEXT NOT NULL,
    "diziId" INTEGER NOT NULL,
    "sezon" INTEGER NOT NULL,
    "bolum" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "diziId", "sezon", "bolum"),
    CONSTRAINT "BolumKaydi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Kayit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "tip" TEXT NOT NULL,
    "durum" TEXT,
    "puan" INTEGER,
    "favori" BOOLEAN NOT NULL DEFAULT false,
    "izlendiTarih" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Kayit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Kayit" ("createdAt", "durum", "id", "puan", "tip", "tmdbId", "updatedAt", "userId") SELECT "createdAt", "durum", "id", "puan", "tip", "tmdbId", "updatedAt", "userId" FROM "Kayit";
DROP TABLE "Kayit";
ALTER TABLE "new_Kayit" RENAME TO "Kayit";
CREATE INDEX "Kayit_userId_durum_updatedAt_idx" ON "Kayit"("userId", "durum", "updatedAt" DESC);
CREATE INDEX "Kayit_userId_favori_idx" ON "Kayit"("userId", "favori");
CREATE INDEX "Kayit_tmdbId_tip_idx" ON "Kayit"("tmdbId", "tip");
CREATE UNIQUE INDEX "Kayit_userId_tmdbId_tip_key" ON "Kayit"("userId", "tmdbId", "tip");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "BolumKaydi_userId_createdAt_idx" ON "BolumKaydi"("userId", "createdAt" DESC);
