import "server-only";
import { unstable_cache } from "next/cache";
import { tmdbFetch } from "./istemci";
import type { PosterOge } from "./gorsel";

type HamSonuc = {
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
};

type Sayfa = { results: HamSonuc[] };

const ALTI_SAAT = 60 * 60 * 6;
const SAYFA_SAYISI = 3;

const KAYNAKLAR: { yol: string; tip: PosterOge["tip"]; params?: Record<string, string> }[] = [
    { yol: "/trending/movie/week", tip: "film" },
    { yol: "/trending/tv/week", tip: "dizi" },
    { yol: "/discover/movie", tip: "film", params: { with_origin_country: "TR", sort_by: "popularity.desc", "vote_count.gte": "20" } },
    { yol: "/discover/tv", tip: "dizi", params: { with_origin_country: "TR", sort_by: "popularity.desc", "vote_count.gte": "10" } },
];

function donustur(tip: PosterOge["tip"]) {
    return (h: HamSonuc): PosterOge | null => {
        if (!h.poster_path) return null;
        const tarih = h.release_date || h.first_air_date;
        return {
            id: h.id,
            tip,
            baslik: h.title ?? h.name ?? "",
            posterPath: h.poster_path,
            yil: tarih ? Number(tarih.slice(0, 4)) : null,
            puan: Math.round((h.vote_average ?? 0) * 10) / 10,
        };
    };
}

async function kaynakGetir({ yol, tip, params }: (typeof KAYNAKLAR)[number]) {
    const sayfalar = await Promise.allSettled(
        Array.from({ length: SAYFA_SAYISI }, (_, i) =>
            tmdbFetch<Sayfa>(yol, { ...params, page: String(i + 1) }, ALTI_SAAT),
        ),
    );
    return sayfalar.flatMap((s) =>
        s.status === "fulfilled" ? s.value.results.map(donustur(tip)).filter((o): o is PosterOge => o !== null) : [],
    );
}

// Giriş ekranındaki poster duvarı için havuz: haftanın trendleri + Türkiye'de popüler
// yapımlar, her kaynaktan 3 sayfa (~200 içerik). Tarayıcı her ziyarette bu havuzdan
// rastgele seçer. Hata veren sayfa/kaynak atlanır.
export const posterHavuzu = unstable_cache(posterHavuzuGetir, ["poster-havuzu"], { revalidate: ALTI_SAAT });

// Tek parça önbelleklenir: sayfa her açılışta 12 ayrı fetch önbelleği yerine tek kayda bakar
async function posterHavuzuGetir(): Promise<PosterOge[]> {
    const listeler = await Promise.all(KAYNAKLAR.map(kaynakGetir));

    const gorulen = new Set<string>();
    return listeler.flat().filter((oge) => {
        const anahtar = `${oge.tip}-${oge.id}`;
        if (gorulen.has(anahtar)) return false;
        gorulen.add(anahtar);
        return true;
    });
}
