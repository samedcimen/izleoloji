import "server-only";
import { db } from "@/lib/db";
import { UYELIK, YASAKLI_KULLANICI_ADLARI } from "@/lib/ayarlar/uyelik";

const TR_HARF: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" };

// "Ayşe Çelik" → "ayse_celik"; kurala uymayan karakterler atılır
function kok(metin: string) {
    const k = metin
        .toLocaleLowerCase("tr-TR")
        .replace(/[çğıöşü]/g, (h) => TR_HARF[h])
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "")
        .slice(0, UYELIK.KULLANICI_ADI_MAX - 4);
    return k.length >= UYELIK.KULLANICI_ADI_MIN && !YASAKLI_KULLANICI_ADLARI.has(k) ? k : "izleyici";
}

// Boştaki ilk kullanıcı adını bulur: ayse_celik, ayse_celik2, ayse_celik3...
// Adaylar tek sorguda kontrol edilir.
export async function kullaniciAdiUret(taban: string) {
    const k = kok(taban);
    const alinmis = new Set(
        (await db.user.findMany({ where: { username: { startsWith: k } }, select: { username: true } }))
            .map((u) => u.username),
    );
    if (!alinmis.has(k)) return k;
    for (let i = 2; i < 10_000; i++) {
        if (!alinmis.has(`${k}${i}`)) return `${k}${i}`;
    }
    return `${k}${Date.now().toString(36)}`.slice(0, UYELIK.KULLANICI_ADI_MAX);
}

const VARSAYILAN_AVATAR_SAYISI = 14;

export function rastgeleAvatar() {
    return `/avatar/izleoloji${Math.floor(Math.random() * VARSAYILAN_AVATAR_SAYISI) + 1}.svg`;
}
