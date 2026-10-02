import "server-only";
import { unstable_cache } from "next/cache";
import { tmdbFetch } from "./istemci";
import type { IcerikKarti, IcerikTipi } from "./gorsel";
import { turAdi } from "./turler";
import { baslikLogosu } from "./detay";

const ALTI_SAAT = 60 * 60 * 6;

// ── TMDB ham tipleri ─────────────────────────────────────────────────────────

type Ham = {
    id: number;
    media_type?: "movie" | "tv" | "person";
    title?: string;
    name?: string;
    overview?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
    vote_count?: number;
    genre_ids?: number[];
};
type Sayfa = { results: Ham[] };

type HamDetay = Ham & {
    runtime?: number;
    episode_run_time?: number[];
    number_of_seasons?: number;
    genres?: { id: number; name: string }[];
    videos?: { results: { key: string; site: string; type: string; iso_639_1: string; official: boolean }[] };
    images?: { logos: { file_path: string; iso_639_1: string | null; aspect_ratio: number }[] };
    original_title?: string;
    original_name?: string;
};

const tmdbTip = (tip: IcerikTipi) => (tip === "film" ? "movie" : "tv");

export function hamdanKart(tip: IcerikTipi) {
    return (h: Ham): IcerikKarti => {
        const tarih = h.release_date || h.first_air_date;
        return {
            id: h.id,
            tip,
            baslik: h.title ?? h.name ?? "",
            posterPath: h.poster_path,
            arkaPlanPath: h.backdrop_path,
            yil: tarih ? Number(tarih.slice(0, 4)) : null,
            puan: Math.round((h.vote_average ?? 0) * 10) / 10,
            ozet: h.overview ?? "",
            turIds: h.genre_ids ?? [],
        };
    };
}

async function liste(tip: IcerikTipi, yol: string, params: Record<string, string> = {}) {
    const s = await tmdbFetch<Sayfa>(yol, params, ALTI_SAAT).catch(() => ({ results: [] as Ham[] }));
    return s.results.filter((h) => h.poster_path).map(hamdanKart(tip));
}

const bugun = () => new Date().toISOString().slice(0, 10);

// ── Vitrin (üstteki dönen alan) ──────────────────────────────────────────────

export type VitrinOge = IcerikKarti & {
    logoPath: string | null; // başlığın görsel logosu (varsa metin yerine gösterilir)
    fragmanKey: string | null; // YouTube
    turAdlari: string[];
    sure: string | null; // "2 sa 46 dk" ya da "3 sezon"
};

async function vitrinDetay(o: IcerikKarti): Promise<VitrinOge> {
    const d = await tmdbFetch<HamDetay>(`/${tmdbTip(o.tip)}/${o.id}`, {
        append_to_response: "videos,images",
        include_image_language: "tr,en,null",
        include_video_language: "tr,en",
    }, ALTI_SAAT).catch(() => null);

    const videolar = d?.videos?.results.filter((v) => v.site === "YouTube" && v.type === "Trailer") ?? [];
    const fragman = videolar.find((v) => v.iso_639_1 === "tr") ?? videolar.find((v) => v.official) ?? videolar[0];

    const dk = d?.runtime ?? d?.episode_run_time?.[0];
    const sure =
        o.tip === "dizi" && d?.number_of_seasons ? `${d.number_of_seasons} sezon`
        : dk ? (dk >= 60 ? `${Math.floor(dk / 60)} sa ${dk % 60} dk` : `${dk} dk`)
        : null;

    return {
        ...o,
        ozet: o.ozet || d?.overview || "",
        logoPath: baslikLogosu(d?.images?.logos ?? [], o.baslik, d?.original_title ?? d?.original_name ?? o.baslik),
        fragmanKey: fragman?.key ?? null,
        turAdlari: (d?.genres?.map((g) => g.name) ?? o.turIds.map((id) => turAdi(id)).filter((x): x is string => !!x)).slice(0, 3),
        sure,
    };
}

// ── Platformlar ──────────────────────────────────────────────────────────────

export const PLATFORMLAR = [
    { id: 8, ad: "Netflix" },
    { id: 119, ad: "Prime Video" },
    { id: 337, ad: "Disney+" },
    { id: 1899, ad: "Max" },
    { id: 342, ad: "puhutv" },
    { id: 11, ad: "MUBI" },
] as const;

// Platforma son eklenen film ve diziler (Türkiye kataloğu), yeniden eskiye
async function platformdaYeni(saglayici: number) {
    const ortak = { watch_region: "TR", with_watch_providers: String(saglayici), "vote_count.gte": "10" };
    const [filmler, diziler] = await Promise.all([
        liste("film", "/discover/movie", { ...ortak, sort_by: "primary_release_date.desc", "primary_release_date.lte": bugun() }),
        liste("dizi", "/discover/tv", { ...ortak, sort_by: "first_air_date.desc", "first_air_date.lte": bugun() }),
    ]);
    return [...filmler, ...diziler]
        .sort((a, b) => (b.yil ?? 0) - (a.yil ?? 0))
        .slice(0, 20);
}

// ── Ana sayfa verisi: tek önbellek kaydı ─────────────────────────────────────

export type AnaSayfaVerisi = Awaited<ReturnType<typeof anaSayfaVerisiGetir>>;

async function anaSayfaVerisiGetir() {
    const [trendler, yerliFilm, yerliDizi, vizyonda, yakinda, trendDiziler, platformlar] = await Promise.all([
        tmdbFetch<Sayfa>("/trending/all/week", {}, ALTI_SAAT).catch(() => ({ results: [] as Ham[] })),
        liste("film", "/discover/movie", { with_origin_country: "TR", sort_by: "popularity.desc", "vote_count.gte": "5" }),
        liste("dizi", "/discover/tv", { with_origin_country: "TR", sort_by: "popularity.desc", "vote_count.gte": "5" }),
        liste("film", "/movie/now_playing", { region: "TR" }),
        liste("film", "/movie/upcoming", { region: "TR" }),
        liste("dizi", "/trending/tv/week"),
        Promise.all(PLATFORMLAR.map(async (p) => ({ ...p, icerikler: await platformdaYeni(p.id) }))),
    ]);

    const trendKartlari = trendler.results
        .filter((h) => (h.media_type === "movie" || h.media_type === "tv") && h.backdrop_path && h.poster_path)
        .map((h) => hamdanKart(h.media_type === "movie" ? "film" : "dizi")(h));

    const vitrin = await Promise.all(trendKartlari.slice(0, 5).map(vitrinDetay));

    // Yerli Top 10: film ve dizileri popülerlik sırasıyla harmanla
    const yerli: IcerikKarti[] = [];
    for (let i = 0; yerli.length < 10 && (i < yerliFilm.length || i < yerliDizi.length); i++) {
        if (yerliDizi[i]) yerli.push(yerliDizi[i]);
        if (yerliFilm[i] && yerli.length < 10) yerli.push(yerliFilm[i]);
    }

    const bugunTarih = bugun();
    return {
        vitrin,
        trendFilmler: trendKartlari.filter((k) => k.tip === "film").slice(5),
        yerliTop10: yerli,
        platformlar: platformlar.filter((p) => p.icerikler.length > 0),
        vizyonda,
        // "Yakında" listesi bazen vizyona girmiş filmleri de içeriyor
        yakinda: yakinda.filter((k) => !k.yil || String(k.yil) >= bugunTarih.slice(0, 4)),
        trendDiziler,
    };
}

// Biçim/kural değişince anahtar sürümü artırılmalı (önbellek kod değişince kendiliğinden yenilenmez)
export const anaSayfaVerisi = unstable_cache(anaSayfaVerisiGetir, ["ana-sayfa", "v2"], { revalidate: ALTI_SAAT });

// ── Türe göre keşif (sayfa açıldıktan sonra seçime göre istenir) ────────────

async function turIcerikleriGetir(film: number | null, dizi: number | null) {
    const [filmler, diziler] = await Promise.all([
        film ? liste("film", "/discover/movie", { with_genres: String(film), sort_by: "popularity.desc", "vote_count.gte": "200" }) : [],
        dizi ? liste("dizi", "/discover/tv", { with_genres: String(dizi), sort_by: "popularity.desc", "vote_count.gte": "100" }) : [],
    ]);
    const sonuc: IcerikKarti[] = [];
    for (let i = 0; i < Math.max(filmler.length, diziler.length); i++) {
        if (filmler[i]) sonuc.push(filmler[i]);
        if (diziler[i]) sonuc.push(diziler[i]);
    }
    return sonuc.slice(0, 20);
}

export const turIcerikleri = unstable_cache(turIcerikleriGetir, ["tur-icerikleri"], { revalidate: ALTI_SAAT });
