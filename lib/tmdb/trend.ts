import "server-only";
import { tmdbFetch } from "./istemci";

export type PosterOge = {
    id: number;
    tip: "film" | "dizi";
    baslik: string;
    posterPath: string;
    yil: number | null;
    puan: number;
};

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

// Giriş ekranındaki poster duvarı için: haftanın trendleri + Türkiye'de popüler yapımlar.
// Kaynaklardan biri hata verirse diğerleriyle devam edilir.
export async function posterDuvariIcerikleri(): Promise<PosterOge[]> {
    const kaynaklar: [Promise<Sayfa>, PosterOge["tip"]][] = [
        [tmdbFetch<Sayfa>("/trending/movie/week", {}, ALTI_SAAT), "film"],
        [tmdbFetch<Sayfa>("/trending/tv/week", {}, ALTI_SAAT), "dizi"],
        [tmdbFetch<Sayfa>("/discover/movie", { with_origin_country: "TR", sort_by: "popularity.desc", "vote_count.gte": "20" }, ALTI_SAAT), "film"],
        [tmdbFetch<Sayfa>("/discover/tv", { with_origin_country: "TR", sort_by: "popularity.desc", "vote_count.gte": "10" }, ALTI_SAAT), "dizi"],
    ];

    const sonuclar = await Promise.allSettled(kaynaklar.map(([istek]) => istek));

    const gorulen = new Set<string>();
    const listeler = sonuclar.map((s, i) =>
        s.status === "fulfilled"
            ? s.value.results.map(donustur(kaynaklar[i][1])).filter((o): o is PosterOge => o !== null)
            : [],
    );

    // Kaynakları sırayla harmanla ki duvarda film/dizi ve yerli/yabancı karışık dursun
    const harman: PosterOge[] = [];
    const enUzun = Math.max(0, ...listeler.map((l) => l.length));
    for (let i = 0; i < enUzun; i++) {
        for (const liste of listeler) {
            const oge = liste[i];
            if (!oge) continue;
            const anahtar = `${oge.tip}-${oge.id}`;
            if (gorulen.has(anahtar)) continue;
            gorulen.add(anahtar);
            harman.push(oge);
        }
    }
    return harman;
}
