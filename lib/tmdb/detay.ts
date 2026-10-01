import "server-only";
import { unstable_cache } from "next/cache";
import { tmdbFetch } from "./istemci";
import type { IcerikKarti, IcerikTipi } from "./gorsel";

const ON_IKI_SAAT = 60 * 60 * 12;

// ── Ortak tipler ─────────────────────────────────────────────────────────────

export type Kisi = { id: number; ad: string; profilPath: string | null; rol: string };
export type Fragman = { key: string; ad: string; tur: string };
export type Platform = { id: number; ad: string; logoPath: string };
export type Platformlar = { link: string | null; abonelik: Platform[]; kirala: Platform[]; satinAl: Platform[] };

type DetayOrtak = {
    id: number;
    tip: IcerikTipi;
    baslik: string;
    orijinalBaslik: string;
    ozet: string;
    slogan: string;
    posterPath: string | null;
    arkaPlanPath: string | null;
    logoPath: string | null;
    yil: number | null;
    tarih: string | null;
    puan: number;
    oySayisi: number;
    turler: { id: number; ad: string }[];
    dil: string | null;
    ulkeler: string[];
    yasSiniri: string | null;
    oyuncular: Kisi[];
    fragmanlar: Fragman[];
    platformlar: Platformlar | null;
    oneriler: IcerikKarti[];
    benzerler: IcerikKarti[];
    imdbId: string | null;
};

export type FilmDetay = DetayOrtak & {
    tip: "film";
    sure: number | null;
    yonetmenler: Kisi[];
    senaristler: Kisi[];
    butce: number;
    hasilat: number;
    seri: { id: number; ad: string; posterPath: string | null; arkaPlanPath: string | null } | null;
};

export type SezonOzet = { no: number; ad: string; bolumSayisi: number; posterPath: string | null; yil: number | null };

export type DiziDetay = DetayOrtak & {
    tip: "dizi";
    bolumSuresi: number | null;
    yaraticilar: Kisi[];
    kanallar: { id: number; ad: string; logoPath: string | null }[];
    durum: string;
    sezonSayisi: number;
    bolumSayisi: number;
    sezonlar: SezonOzet[];
    sonrakiBolum: { sezon: number; bolum: number; ad: string; tarih: string | null } | null;
};

export type Bolum = {
    no: number;
    ad: string;
    ozet: string;
    tarih: string | null;
    sure: number | null;
    puan: number;
    gorselPath: string | null;
};

export type SezonDetay = { no: number; ad: string; ozet: string; posterPath: string | null; bolumler: Bolum[] };

export type KisiDetay = {
    id: number;
    ad: string;
    biyografi: string;
    profilPath: string | null;
    bilinenAlan: string | null;
    dogum: string | null;
    olum: string | null;
    dogumYeri: string | null;
    cinsiyet: number;
    imdbId: string | null;
    instagram: string | null;
    bilinenIsler: IcerikKarti[];
    filmler: (IcerikKarti & { rol: string })[];
    diziler: (IcerikKarti & { rol: string })[];
};

// ── TMDB ham tipleri (yalnız kullanılan alanlar) ─────────────────────────────

type HamListe = {
    id: number;
    media_type?: string;
    title?: string;
    name?: string;
    overview?: string;
    poster_path: string | null;
    backdrop_path?: string | null;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
    vote_count?: number;
    popularity?: number;
    genre_ids?: number[];
    character?: string;
    job?: string;
    episode_count?: number;
};

type HamKisi = { id: number; name: string; profile_path: string | null; character?: string; job?: string; department?: string; roles?: { character: string }[] };
type HamSaglayici = { provider_id: number; provider_name: string; logo_path: string };

type HamDetay = HamListe & {
    original_title?: string;
    original_name?: string;
    tagline?: string;
    runtime?: number;
    episode_run_time?: number[];
    genres: { id: number; name: string }[];
    original_language?: string;
    production_countries?: { iso_3166_1: string; name: string }[];
    origin_country?: string[];
    budget?: number;
    revenue?: number;
    imdb_id?: string | null;
    status?: string;
    number_of_seasons?: number;
    number_of_episodes?: number;
    seasons?: { season_number: number; name: string; episode_count: number; poster_path: string | null; air_date: string | null }[];
    networks?: { id: number; name: string; logo_path: string | null }[];
    created_by?: { id: number; name: string; profile_path: string | null }[];
    next_episode_to_air?: { season_number: number; episode_number: number; name: string; air_date: string | null } | null;
    belongs_to_collection?: { id: number; name: string; poster_path: string | null; backdrop_path: string | null } | null;
    credits?: { cast: HamKisi[]; crew: HamKisi[] };
    aggregate_credits?: { cast: HamKisi[] };
    videos?: { results: { key: string; name: string; site: string; type: string; iso_639_1: string; official: boolean }[] };
    images?: { logos: { file_path: string; iso_639_1: string | null }[] };
    "watch/providers"?: { results: Record<string, { link?: string; flatrate?: HamSaglayici[]; rent?: HamSaglayici[]; buy?: HamSaglayici[] }> };
    recommendations?: { results: HamListe[] };
    similar?: { results: HamListe[] };
    release_dates?: { results: { iso_3166_1: string; release_dates: { certification: string }[] }[] };
    content_ratings?: { results: { iso_3166_1: string; rating: string }[] };
    external_ids?: { imdb_id?: string | null };
};

// ── Dönüştürücüler ───────────────────────────────────────────────────────────

const yilAl = (t?: string | null) => (t ? Number(t.slice(0, 4)) : null);

function kart(h: HamListe, varsayilan?: IcerikTipi): IcerikKarti | null {
    const tip: IcerikTipi | null = h.media_type === "movie" ? "film" : h.media_type === "tv" ? "dizi" : (varsayilan ?? null);
    if (!tip) return null;
    return {
        id: h.id,
        tip,
        baslik: h.title ?? h.name ?? "",
        posterPath: h.poster_path,
        arkaPlanPath: h.backdrop_path ?? null,
        yil: yilAl(h.release_date || h.first_air_date),
        puan: Math.round((h.vote_average ?? 0) * 10) / 10,
        ozet: h.overview ?? "",
        turIds: h.genre_ids ?? [],
    };
}

const kartlar = (l: HamListe[] | undefined, tip: IcerikTipi) =>
    (l ?? []).filter((h) => h.poster_path).map((h) => kart(h, tip)).filter((k): k is IcerikKarti => !!k).slice(0, 20);

const kisi = (k: HamKisi, rol: string): Kisi => ({ id: k.id, ad: k.name, profilPath: k.profile_path, rol });

function fragmanlar(d: HamDetay): Fragman[] {
    const yt = d.videos?.results.filter((v) => v.site === "YouTube" && ["Trailer", "Teaser"].includes(v.type)) ?? [];
    // Türkçe ve resmi fragmanlar öne
    yt.sort((a, b) => Number(b.iso_639_1 === "tr") - Number(a.iso_639_1 === "tr") || Number(b.type === "Trailer") - Number(a.type === "Trailer") || Number(b.official) - Number(a.official));
    return yt.slice(0, 8).map((v) => ({ key: v.key, ad: v.name, tur: v.type === "Trailer" ? "Fragman" : "Teaser" }));
}

function platformlar(d: HamDetay): Platformlar | null {
    const tr = d["watch/providers"]?.results.TR;
    if (!tr) return null;
    const p = (l?: HamSaglayici[]) => (l ?? []).map((s) => ({ id: s.provider_id, ad: s.provider_name, logoPath: s.logo_path }));
    const sonuc = { link: tr.link ?? null, abonelik: p(tr.flatrate), kirala: p(tr.rent), satinAl: p(tr.buy) };
    return sonuc.abonelik.length + sonuc.kirala.length + sonuc.satinAl.length ? sonuc : null;
}

// Türkçe logo varsa o; yoksa yabancı logo yalnızca başlık çevrilmemişse (Türkçe adı orijinaliyle
// aynıysa) kullanılır — aksi halde "Cennetin Doğusu" yerine "East of Eden" logosu çıkardı.
export function baslikLogosu(logolar: { file_path: string; iso_639_1: string | null }[], baslik: string, orijinal: string) {
    const tr = logolar.find((x) => x.iso_639_1 === "tr");
    if (tr) return tr.file_path;
    if (baslik.trim().toLocaleLowerCase("tr") !== orijinal.trim().toLocaleLowerCase("tr")) return null;
    return (logolar.find((x) => x.iso_639_1 === "en") ?? logolar[0])?.file_path ?? null;
}

function logo(d: HamDetay) {
    return baslikLogosu(d.images?.logos ?? [], d.title ?? d.name ?? "", d.original_title ?? d.original_name ?? "");
}

const ULKE = new Intl.DisplayNames(["tr"], { type: "region" });
const DIL = new Intl.DisplayNames(["tr"], { type: "language" });
const ulkeAdi = (kod: string) => { try { return ULKE.of(kod) ?? kod; } catch { return kod; } };
const dilAdi = (kod?: string) => { if (!kod) return null; try { return DIL.of(kod) ?? kod; } catch { return kod; } };

// Türkçe açıklaması boş içerikler için İngilizce yedek (yalnız önbellek dolarken çağrılır)
async function ingilizceOzet(yol: string) {
    const d = await tmdbFetch<{ overview?: string; biography?: string }>(yol, { language: "en-US" }, ON_IKI_SAAT).catch(() => null);
    return d?.overview || d?.biography || "";
}

function ortak(d: HamDetay, tip: IcerikTipi, ozet: string): Omit<DetayOrtak, "oyuncular" | "yasSiniri"> {
    const tarih = d.release_date || d.first_air_date || null;
    return {
        id: d.id,
        tip,
        baslik: d.title ?? d.name ?? "",
        orijinalBaslik: d.original_title ?? d.original_name ?? "",
        ozet,
        slogan: d.tagline ?? "",
        posterPath: d.poster_path,
        arkaPlanPath: d.backdrop_path ?? null,
        logoPath: logo(d),
        yil: yilAl(tarih),
        tarih,
        puan: Math.round((d.vote_average ?? 0) * 10) / 10,
        oySayisi: d.vote_count ?? 0,
        turler: d.genres.map((g) => ({ id: g.id, ad: g.name })),
        dil: dilAdi(d.original_language),
        ulkeler: (d.production_countries?.map((c) => c.iso_3166_1) ?? d.origin_country ?? []).map(ulkeAdi),
        fragmanlar: fragmanlar(d),
        platformlar: platformlar(d),
        oneriler: kartlar(d.recommendations?.results, tip),
        benzerler: kartlar(d.similar?.results, tip),
        imdbId: d.imdb_id ?? d.external_ids?.imdb_id ?? null,
    };
}

const EK = { include_image_language: "tr,en,null", include_video_language: "tr,en" };

// ── Film ─────────────────────────────────────────────────────────────────────

async function filmGetir(id: number): Promise<FilmDetay | null> {
    const d = await tmdbFetch<HamDetay>(`/movie/${id}`, {
        append_to_response: "credits,videos,images,watch/providers,recommendations,similar,release_dates",
        ...EK,
    }, ON_IKI_SAAT).catch((h: Error) => { if (h.message.includes(": 404")) return null; throw h; });
    if (!d) return null;

    const yas = d.release_dates?.results.find((r) => r.iso_3166_1 === "TR") ?? d.release_dates?.results.find((r) => r.iso_3166_1 === "US");
    const ekip = d.credits?.crew ?? [];
    return {
        ...ortak(d, "film", d.overview || (await ingilizceOzet(`/movie/${id}`))),
        tip: "film",
        yasSiniri: yas?.release_dates.find((r) => r.certification)?.certification ?? null,
        oyuncular: (d.credits?.cast ?? []).slice(0, 20).map((k) => kisi(k, k.character ?? "")),
        sure: d.runtime || null,
        yonetmenler: ekip.filter((k) => k.job === "Director").map((k) => kisi(k, "Yönetmen")),
        senaristler: ekip.filter((k) => ["Screenplay", "Writer"].includes(k.job ?? "")).slice(0, 4).map((k) => kisi(k, "Senarist")),
        butce: d.budget ?? 0,
        hasilat: d.revenue ?? 0,
        seri: d.belongs_to_collection
            ? { id: d.belongs_to_collection.id, ad: d.belongs_to_collection.name, posterPath: d.belongs_to_collection.poster_path, arkaPlanPath: d.belongs_to_collection.backdrop_path }
            : null,
    };
}

// ── Dizi ─────────────────────────────────────────────────────────────────────

const DURUM: Record<string, string> = {
    "Returning Series": "Devam ediyor",
    Ended: "Sona erdi",
    Canceled: "İptal edildi",
    "In Production": "Yapım aşamasında",
    Planned: "Planlanıyor",
    Pilot: "Pilot",
};

async function diziGetir(id: number): Promise<DiziDetay | null> {
    const d = await tmdbFetch<HamDetay>(`/tv/${id}`, {
        append_to_response: "aggregate_credits,videos,images,watch/providers,recommendations,similar,content_ratings,external_ids",
        ...EK,
    }, ON_IKI_SAAT).catch((h: Error) => { if (h.message.includes(": 404")) return null; throw h; });
    if (!d) return null;

    const yas = d.content_ratings?.results.find((r) => r.iso_3166_1 === "TR") ?? d.content_ratings?.results.find((r) => r.iso_3166_1 === "US");
    const s = d.next_episode_to_air;
    return {
        ...ortak(d, "dizi", d.overview || (await ingilizceOzet(`/tv/${id}`))),
        tip: "dizi",
        yasSiniri: yas?.rating || null,
        oyuncular: (d.aggregate_credits?.cast ?? []).slice(0, 20).map((k) => kisi(k, k.roles?.[0]?.character ?? "")),
        bolumSuresi: d.episode_run_time?.[0] ?? null,
        yaraticilar: (d.created_by ?? []).map((k) => ({ id: k.id, ad: k.name, profilPath: k.profile_path, rol: "Yaratıcı" })),
        kanallar: (d.networks ?? []).map((k) => ({ id: k.id, ad: k.name, logoPath: k.logo_path })),
        durum: DURUM[d.status ?? ""] ?? d.status ?? "",
        sezonSayisi: d.number_of_seasons ?? 0,
        bolumSayisi: d.number_of_episodes ?? 0,
        // "Özel bölümler" (0. sezon) sona
        sezonlar: (d.seasons ?? [])
            .filter((x) => x.episode_count > 0)
            .map((x) => ({ no: x.season_number, ad: x.name, bolumSayisi: x.episode_count, posterPath: x.poster_path, yil: yilAl(x.air_date) }))
            .sort((a, b) => (a.no === 0 ? 1 : b.no === 0 ? -1 : a.no - b.no)),
        sonrakiBolum:
            s && (!s.air_date || s.air_date > new Date().toISOString().slice(0, 10))
                ? { sezon: s.season_number, bolum: s.episode_number, ad: /^(d+. bölüm|episode d+)$/i.test(s.name) ? "" : s.name, tarih: s.air_date }
                : null,
    };
}

type HamSezon = {
    season_number: number;
    name: string;
    overview: string;
    poster_path: string | null;
    episodes: { episode_number: number; name: string; overview: string; air_date: string | null; runtime: number | null; vote_average: number; still_path: string | null }[];
};

async function sezonGetir(diziId: number, no: number): Promise<SezonDetay | null> {
    const d = await tmdbFetch<HamSezon>(`/tv/${diziId}/season/${no}`, {}, ON_IKI_SAAT).catch(() => null);
    if (!d) return null;
    return {
        no: d.season_number,
        ad: d.name,
        ozet: d.overview,
        posterPath: d.poster_path,
        bolumler: d.episodes.map((b) => ({
            no: b.episode_number,
            ad: b.name,
            ozet: b.overview,
            tarih: b.air_date,
            sure: b.runtime,
            puan: Math.round(b.vote_average * 10) / 10,
            gorselPath: b.still_path,
        })),
    };
}

// ── Kişi ─────────────────────────────────────────────────────────────────────

type HamKisiDetay = {
    id: number;
    name: string;
    biography: string;
    profile_path: string | null;
    known_for_department: string | null;
    birthday: string | null;
    deathday: string | null;
    place_of_birth: string | null;
    gender: number;
    combined_credits?: { cast: HamListe[]; crew: HamListe[] };
    external_ids?: { imdb_id?: string | null; instagram_id?: string | null };
};

const ALAN: Record<string, string> = { Acting: "Oyuncu", Directing: "Yönetmen", Writing: "Senarist", Production: "Yapımcı", Sound: "Müzik", Camera: "Görüntü yönetmeni" };

async function kisiGetir(id: number): Promise<KisiDetay | null> {
    const d = await tmdbFetch<HamKisiDetay>(`/person/${id}`, { append_to_response: "combined_credits,external_ids" }, ON_IKI_SAAT)
        .catch((h: Error) => { if (h.message.includes(": 404")) return null; throw h; });
    if (!d) return null;

    // Aynı yapımda birden fazla rol olabilir; tekilleştir
    const gorulen = new Set<string>();
    const isler = (d.combined_credits?.cast ?? [])
        .filter((h) => h.poster_path && (h.media_type === "movie" || h.media_type === "tv"))
        // talk show / tören gibi kendisi olarak çıktığı kayıtları ele
        .filter((h) => !/^(self|himself|herself|kendisi)\b/i.test(h.character ?? ""))
        .filter((h) => { const a = `${h.media_type}-${h.id}`; if (gorulen.has(a)) return false; gorulen.add(a); return true; })
        .map((h) => ({ ...kart(h)!, rol: h.character ?? "" }));

    // "En bilinen işleri" sıralaması için oy sayıları (karta eklenmez)
    const oylar = new Map((d.combined_credits?.cast ?? []).map((h) => [`${h.media_type}-${h.id}`, h.vote_count ?? 0]));
    const oy = (x: IcerikKarti) => oylar.get(`${x.tip === "film" ? "movie" : "tv"}-${x.id}`) ?? 0;
    const tarihSirali = (a: { yil: number | null }, b: { yil: number | null }) => (b.yil ?? 9999) - (a.yil ?? 9999);

    return {
        id: d.id,
        ad: d.name,
        biyografi: d.biography || (await ingilizceOzet(`/person/${id}`)),
        profilPath: d.profile_path,
        bilinenAlan: d.known_for_department ? (ALAN[d.known_for_department] ?? d.known_for_department) : null,
        dogum: d.birthday,
        olum: d.deathday,
        dogumYeri: d.place_of_birth,
        cinsiyet: d.gender,
        imdbId: d.external_ids?.imdb_id ?? null,
        instagram: d.external_ids?.instagram_id ?? null,
        // En bilinen işleri: çok oy almış yapımlar
        bilinenIsler: [...isler].sort((a, b) => oy(b) - oy(a)).slice(0, 12),
        filmler: isler.filter((x) => x.tip === "film").sort(tarihSirali),
        diziler: isler.filter((x) => x.tip === "dizi").sort(tarihSirali),
    };
}

// Önbellek anahtarı kod değişince kendiliğinden değişmez (Vercel'de deploy'lar arasında da korunur):
// dönen verinin biçimi/kuralı değişirse SURUM artırılmalı.
const SURUM = "v2";
export const filmDetay = unstable_cache(filmGetir, ["film-detay", SURUM], { revalidate: ON_IKI_SAAT });
export const diziDetay = unstable_cache(diziGetir, ["dizi-detay", SURUM], { revalidate: ON_IKI_SAAT });
export const sezonDetay = unstable_cache(sezonGetir, ["sezon-detay", SURUM], { revalidate: ON_IKI_SAAT });
export const kisiDetay = unstable_cache(kisiGetir, ["kisi-detay", SURUM], { revalidate: ON_IKI_SAAT });
