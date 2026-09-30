-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "username" TEXT,
    "usernameChangedAt" DATETIME,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "originalImage" TEXT,
    "bio" TEXT,
    "twitter" TEXT,
    "instagram" TEXT,
    "tiktok" TEXT,
    "coverTema" TEXT,
    "password" TEXT,
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "loginLockedUntil" DATETIME,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "aramaMetni" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserAyar" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "profilGizli" BOOLEAN NOT NULL DEFAULT false,
    "listeGizli" BOOLEAN NOT NULL DEFAULT false,
    "bildirimTakip" BOOLEAN NOT NULL DEFAULT true,
    "bildirimYorum" BOOLEAN NOT NULL DEFAULT true,
    "bildirimEmail" BOOLEAN NOT NULL DEFAULT false,
    "varsayilanDurum" TEXT NOT NULL DEFAULT 'izledi',
    "spoilerGizle" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "UserAyar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Kayit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "tip" TEXT NOT NULL,
    "durum" TEXT,
    "puan" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Kayit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Liste" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "aciklama" TEXT,
    "gizli" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Liste_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ListeOge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listeId" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "tip" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ListeOge_listeId_fkey" FOREIGN KEY ("listeId") REFERENCES "Liste" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ListeBegeni" (
    "listeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("listeId", "userId"),
    CONSTRAINT "ListeBegeni_listeId_fkey" FOREIGN KEY ("listeId") REFERENCES "Liste" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ListeBegeni_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Takip" (
    "takipciId" TEXT NOT NULL,
    "takipEdilenId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("takipciId", "takipEdilenId"),
    CONSTRAINT "Takip_takipciId_fkey" FOREIGN KEY ("takipciId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Takip_takipEdilenId_fkey" FOREIGN KEY ("takipEdilenId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OyuncuTakip" (
    "userId" TEXT NOT NULL,
    "oyuncuId" INTEGER NOT NULL,
    "ad" TEXT NOT NULL,
    "fotograf" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "oyuncuId"),
    CONSTRAINT "OyuncuTakip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Yorum" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "tip" TEXT NOT NULL,
    "icerik" TEXT NOT NULL,
    "spoiler" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "duzenlendiMi" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Yorum_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Yorum_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Yorum" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "YorumBegeni" (
    "yorumId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    PRIMARY KEY ("yorumId", "userId"),
    CONSTRAINT "YorumBegeni_yorumId_fkey" FOREIGN KEY ("yorumId") REFERENCES "Yorum" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "YorumBegeni_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bildirim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "gonderId" TEXT,
    "tip" TEXT NOT NULL,
    "okundu" BOOLEAN NOT NULL DEFAULT false,
    "tmdbId" INTEGER,
    "icerikTip" TEXT,
    "listeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bildirim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Bildirim_gonderId_fkey" FOREIGN KEY ("gonderId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Bildirim_listeId_fkey" FOREIGN KEY ("listeId") REFERENCES "Liste" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IcerikOnbellek" (
    "tmdbId" INTEGER NOT NULL,
    "tip" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "orijinalBaslik" TEXT,
    "posterPath" TEXT,
    "backdropPath" TEXT,
    "yil" INTEGER,
    "turIds" TEXT NOT NULL DEFAULT '[]',
    "guncellendi" DATETIME NOT NULL,

    PRIMARY KEY ("tmdbId", "tip")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "anahtar" TEXT NOT NULL PRIMARY KEY,
    "sayac" INTEGER NOT NULL DEFAULT 0,
    "bitis" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "IletisimMesaj" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ad" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "konu" TEXT NOT NULL,
    "mesaj" TEXT NOT NULL,
    "okundu" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_aramaMetni_idx" ON "User"("aramaMetni");

-- CreateIndex
CREATE INDEX "Kayit_userId_durum_updatedAt_idx" ON "Kayit"("userId", "durum", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "Kayit_tmdbId_tip_idx" ON "Kayit"("tmdbId", "tip");

-- CreateIndex
CREATE UNIQUE INDEX "Kayit_userId_tmdbId_tip_key" ON "Kayit"("userId", "tmdbId", "tip");

-- CreateIndex
CREATE UNIQUE INDEX "Liste_userId_ad_key" ON "Liste"("userId", "ad");

-- CreateIndex
CREATE UNIQUE INDEX "ListeOge_listeId_tmdbId_tip_key" ON "ListeOge"("listeId", "tmdbId", "tip");

-- CreateIndex
CREATE INDEX "ListeBegeni_userId_idx" ON "ListeBegeni"("userId");

-- CreateIndex
CREATE INDEX "Takip_takipEdilenId_idx" ON "Takip"("takipEdilenId");

-- CreateIndex
CREATE INDEX "Yorum_tmdbId_tip_createdAt_idx" ON "Yorum"("tmdbId", "tip", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Yorum_userId_idx" ON "Yorum"("userId");

-- CreateIndex
CREATE INDEX "Yorum_parentId_idx" ON "Yorum"("parentId");

-- CreateIndex
CREATE INDEX "YorumBegeni_userId_idx" ON "YorumBegeni"("userId");

-- CreateIndex
CREATE INDEX "Bildirim_userId_okundu_idx" ON "Bildirim"("userId", "okundu");

-- CreateIndex
CREATE INDEX "Bildirim_userId_createdAt_idx" ON "Bildirim"("userId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");

-- CreateIndex
CREATE INDEX "IletisimMesaj_createdAt_idx" ON "IletisimMesaj"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
