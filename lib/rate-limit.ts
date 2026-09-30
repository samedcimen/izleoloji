import "server-only";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { LIMITLER } from "@/lib/ayarlar/uyelik";

// Sabit pencereli sayaç. Vercel'de her istek ayrı bir sunucuda çalışabildiği için
// sayaçlar bellekte değil veritabanında; artırma + pencere sıfırlama tek atomik SQL.
export async function limitAsildiMi(tur: keyof typeof LIMITLER, kimlik: string): Promise<boolean> {
    const [enFazla, pencere] = LIMITLER[tur];
    const simdi = Math.floor(Date.now() / 1000);
    const anahtar = `${tur}:${kimlik}`;

    const satirlar = await db.$queryRaw<{ sayac: number }[]>`
        INSERT INTO "RateLimit" ("anahtar", "sayac", "bitis") VALUES (${anahtar}, 1, ${simdi + pencere})
        ON CONFLICT ("anahtar") DO UPDATE SET
            "sayac" = CASE WHEN "bitis" <= ${simdi} THEN 1 ELSE "sayac" + 1 END,
            "bitis" = CASE WHEN "bitis" <= ${simdi} THEN excluded."bitis" ELSE "bitis" END
        RETURNING "sayac"`;

    // Eski kayıtları ara sıra temizle (tabloyu küçük tutmak için, isteği bekletmeden)
    if (Math.random() < 0.02) {
        db.$executeRaw`DELETE FROM "RateLimit" WHERE "bitis" < ${simdi}`.catch(() => {});
    }

    return Number(satirlar[0]?.sayac ?? 0) > enFazla;
}

// Vercel ve çoğu proxy istemci IP'sini x-forwarded-for'un ilk elemanında verir
export async function istemciIp() {
    const h = await headers();
    return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "bilinmiyor";
}
