// Prisma'nın ürettiği migration SQL'lerini Turso veritabanına uygular.
// Prisma CLI libsql:// adreslerine doğrudan migrate yapamadığı için gerekli.
//
// Kullanım:
//   npm run db:turso                          → .env'deki veritabanı (izleoloji-dev)
//   npm run db:turso -- .env.production.local → başka bir env dosyasındaki veritabanı (canlı)
//
// Uygulanan migration'lar Turso'da "_izleoloji_migrations" tablosunda tutulur;
// betik tekrar çalıştırıldığında yalnızca yenileri uygular.

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { config } from "dotenv";
import { createClient } from "@libsql/client";

const envDosyasi = process.argv[2] ?? ".env";
if (!existsSync(envDosyasi)) {
    console.error(`${envDosyasi} bulunamadı.`);
    process.exit(1);
}
config({ path: envDosyasi, quiet: true });

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url?.startsWith("libsql://") || !authToken) {
    console.error(`${envDosyasi} içinde libsql:// ile başlayan DATABASE_URL ve DATABASE_AUTH_TOKEN olmalı.`);
    process.exit(1);
}

const klasor = "prisma/migrations";
const migrationlar = readdirSync(klasor, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(klasor, d.name, "migration.sql")))
    .map((d) => d.name)
    .sort();

const db = createClient({ url, authToken });
console.log(`Hedef: ${new URL(url).hostname}`);

await db.execute(`CREATE TABLE IF NOT EXISTS "_izleoloji_migrations" (
    "ad" TEXT NOT NULL PRIMARY KEY,
    "uygulandi" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
)`);

const uygulanmis = new Set(
    (await db.execute(`SELECT "ad" FROM "_izleoloji_migrations"`)).rows.map((r) => r.ad),
);

const bekleyen = migrationlar.filter((ad) => !uygulanmis.has(ad));
if (bekleyen.length === 0) {
    console.log("Veritabanı güncel, uygulanacak migration yok.");
    process.exit(0);
}

for (const ad of bekleyen) {
    const sql = readFileSync(join(klasor, ad, "migration.sql"), "utf8");
    const adSql = ad.replaceAll("'", "''");
    try {
        await db.executeMultiple(`BEGIN;\n${sql}\nINSERT INTO "_izleoloji_migrations" ("ad") VALUES ('${adSql}');\nCOMMIT;`);
        console.log(`✓ ${ad}`);
    } catch (hata) {
        await db.execute("ROLLBACK").catch(() => {});
        console.error(`✗ ${ad}: ${hata.message}`);
        process.exit(1);
    }
}

console.log(`${bekleyen.length} migration uygulandı.`);
