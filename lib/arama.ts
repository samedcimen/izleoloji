import "server-only";
import { db } from "@/lib/db";
import { kucukHarf } from "@/lib/metin";
import { tmdbFetch } from "@/lib/tmdb/istemci";
import { hamdanKart } from "@/lib/tmdb/ana-sayfa";
import type { IcerikKarti } from "@/lib/tmdb/gorsel";

const ON_DAKIKA = 600;
export const ARAMA_EN_KISA = 2;
export const ARAMA_EN_UZUN = 100;

// ── Tipler ───────────────────────────────────────────────────────────────────

export type KisiSonucu = { id: number; ad: string; profilPath: string | null; alan: string; bilinen: string[] };
export type KullaniciSonucu = { id: string; ad: string | null; kullaniciAdi: string; resim: string | null };
export type HizliSonuclar = { icerikler: IcerikKarti[]; kisiler: KisiSonucu[]; kullanicilar: KullaniciSonucu[] };
export type AramaSekmesi = "tumu" | "film" | "dizi" | "kisi" | "kullanici";

type Ham = {
    id: number;
    media_type?: "movie" | "tv" | "person";
    title?: string;
    name?: string;
    original_title?: string;
    original_name?: string;
    overview?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    profile_path?: string | null;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
    vote_count?: number;
    genre_ids?: number[];
    known_for_department?: string;
    known_for?: Ham[];
};
type Sayfa = { results: Ham[]; total_pages: number; total_results: number };

const ALANLAR: Record<string, string> = {
    Acting: "Oyuncu", Directing: "Yönetmen", Writing: "Senarist", Production: "Yapımcı",
    Sound: "Müzik", Camera: "Görüntü", Editing: "Kurgu", Creator: "Yaratıcı",
};

// Kısaltmalar, büyük/küçük harf ve noktalama farkı tam eşleşmeyi bozmasın
const sade = (s: string) => kucukHarf(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();

// Afişi ve oyu olmayan kayıtlar (TMDB'deki boş girişler) sonuçları kirletmesin
const anlamli = (h: Ham) => !!h.poster_path || (h.vote_count ?? 0) > 0;

function kisi(h: Ham): KisiSonucu {
    return {
        id: h.id,
        ad: h.name ?? "",
        profilPath: h.profile_path ?? null,
        alan: ALANLAR[h.known_for_department ?? ""] ?? "Sinema",
        bilinen: (h.known_for ?? []).map((k) => k.title ?? k.name ?? "").filter(Boolean).slice(0, 2),
    };
}

// TMDB'nin sırası tek başına zayıf (az bilinen birebir eşleşmeler öne geçebiliyor). Puan:
// bilinirlik (oy sayısının logaritması) + başlık birebir eşleşiyorsa / aramayla başlıyorsa ek puan
// − başlıkta hiç geçmiyorsa ceza + TMDB sırasından küçük bir pay. Kişilerde oy olmadığından TMDB sırası (popülerlik) korunur.
function sirala<T extends Ham>(sonuclar: T[], q: string) {
    const aranan = sade(q);
    const puan = (h: T, i: number) => {
        if (h.media_type === "person") return 2 - i * 0.05;
        const basliklar = [h.title, h.name, h.original_title, h.original_name].filter((b): b is string => !!b).map(sade);
        const tam = basliklar.some((b) => b === aranan);
        const basi = !tam && basliklar.some((b) => b.startsWith(aranan));
        // Aranan metin başlıkta kelime olarak hiç geçmiyorsa (TMDB'nin gevşek eşleşmesi) geriye it
        const geciyor = basliklar.some((b) => ` ${b} `.includes(` ${aranan}`));
        return Math.log10((h.vote_count ?? 0) + 1) + (tam ? 1 : basi ? 0.5 : 0) - (geciyor ? 0 : 1.5) - i * 0.05;
    };
    return sonuclar.map((h, i) => ({ h, p: puan(h, i) })).sort((a, b) => b.p - a.p).map((x) => x.h);
}

const ara = (yol: string, q: string, sayfa = 1) =>
    tmdbFetch<Sayfa>(yol, { query: q, include_adult: "false", page: String(sayfa) }, ON_DAKIKA);

// ── Kullanıcılar ─────────────────────────────────────────────────────────────

async function kullaniciAra(q: string, sinir: number, atla = 0) {
    const aranan = kucukHarf(q.replace(/^@/, ""));
    const where = { username: { not: null }, aramaMetni: { contains: aranan } };
    const [toplam, satirlar] = await Promise.all([
        db.user.count({ where }),
        db.user.findMany({ where, select: { id: true, name: true, username: true, image: true }, orderBy: { xp: "desc" }, take: sinir, skip: atla }),
    ]);
    // Kullanıcı adı aranan metinle başlayanlar önde
    const sonuc = satirlar
        .map((u) => ({ id: u.id, ad: u.name, kullaniciAdi: u.username!, resim: u.image }))
        .sort((a, b) => Number(b.kullaniciAdi.startsWith(aranan)) - Number(a.kullaniciAdi.startsWith(aranan)));
    return { toplam, sonuc };
}

// ── Canlı arama (açılır pencere) ─────────────────────────────────────────────

export async function hizliAra(q: string, icerikSiniri = 7): Promise<HizliSonuclar> {
    const [tmdb, kullanicilar] = await Promise.all([
        ara("/search/multi", q).catch(() => ({ results: [] as Ham[] })),
        kullaniciAra(q, 4).catch(() => ({ sonuc: [] })),
    ]);
    const sirali = sirala(tmdb.results, q);
    return {
        icerikler: sirali
            .filter((h) => (h.media_type === "movie" || h.media_type === "tv") && anlamli(h))
            .slice(0, icerikSiniri)
            .map((h) => hamdanKart(h.media_type === "movie" ? "film" : "dizi")({ ...h, poster_path: h.poster_path ?? null, backdrop_path: h.backdrop_path ?? null })),
        kisiler: sirali.filter((h) => h.media_type === "person" && h.profile_path).slice(0, 4).map(kisi),
        kullanicilar: kullanicilar.sonuc,
    };
}

// ── Arama sayfası ────────────────────────────────────────────────────────────

export type AramaSayfasi =
    | { sekme: "tumu"; hizli: HizliSonuclar }
    | { sekme: "film" | "dizi"; icerikler: IcerikKarti[]; toplam: number; toplamSayfa: number }
    | { sekme: "kisi"; kisiler: KisiSonucu[]; toplam: number; toplamSayfa: number }
    | { sekme: "kullanici"; kullanicilar: KullaniciSonucu[]; toplam: number; toplamSayfa: number };

const KULLANICI_SAYFA = 24;

export async function aramaSayfasi(q: string, sekme: AramaSekmesi, sayfa: number): Promise<AramaSayfasi> {
    switch (sekme) {
        case "tumu":
            return { sekme, hizli: await hizliAra(q, 12) };
        case "film":
        case "dizi": {
            const s = await ara(sekme === "film" ? "/search/movie" : "/search/tv", q, sayfa);
            const sonuclar = sayfa === 1 ? sirala(s.results, q) : s.results;
            return {
                sekme,
                icerikler: sonuclar.filter(anlamli).map((h) => hamdanKart(sekme)({ ...h, poster_path: h.poster_path ?? null, backdrop_path: h.backdrop_path ?? null })),
                toplam: s.total_results,
                toplamSayfa: Math.min(s.total_pages, 500),
            };
        }
        case "kisi": {
            const s = await ara("/search/person", q, sayfa);
            return { sekme, kisiler: s.results.map(kisi), toplam: s.total_results, toplamSayfa: Math.min(s.total_pages, 500) };
        }
        case "kullanici": {
            const { toplam, sonuc } = await kullaniciAra(q, KULLANICI_SAYFA, (sayfa - 1) * KULLANICI_SAYFA);
            return { sekme, kullanicilar: sonuc, toplam, toplamSayfa: Math.max(1, Math.ceil(toplam / KULLANICI_SAYFA)) };
        }
    }
}
