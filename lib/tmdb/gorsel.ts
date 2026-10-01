// Hem sunucu hem tarayıcı tarafında kullanılabilen TMDB görsel yardımcıları ve tipleri.

// TMDB görselleri kendi CDN'inden hazır boyutlarda gelir; Vercel'in görsel
// optimizasyon kotasını harcamamak için doğrudan bu boyutlar kullanılır.
export const TMDB_GORSEL = "https://image.tmdb.org/t/p";

export const posterUrl = (yol: string, boyut: "w185" | "w342" | "w500" = "w342") => `${TMDB_GORSEL}/${boyut}${yol}`;
export const arkaPlanUrl = (yol: string, boyut: "w780" | "w1280" | "original" = "w1280") => `${TMDB_GORSEL}/${boyut}${yol}`;
export const logoUrl = (yol: string, boyut: "w300" | "w500" = "w500") => `${TMDB_GORSEL}/${boyut}${yol}`;
export const profilUrl = (yol: string, boyut: "w185" | "h632" = "w185") => `${TMDB_GORSEL}/${boyut}${yol}`;
export const bolumGorselUrl = (yol: string) => `${TMDB_GORSEL}/w300${yol}`;

// Türkiye'deki platformlar için public/logo'da yerel logo var; yoksa TMDB'nin logosu
const YEREL_LOGOLAR = new Set([
    2, 3, 8, 10, 11, 119, 188, 190, 283, 309, 315, 337, 342, 444, 475, 546, 551, 554, 559, 567, 569, 677, 692,
    1715, 1771, 1791, 1826, 1833, 1899, 1904, 1905, 2235, 2285, 2330, 2478, 2555, 2603, 2620, 2623, 2685,
]);
export const platformLogoUrl = (id: number, logoPath: string) => (YEREL_LOGOLAR.has(id) ? `/logo/${id}.jpg` : `${TMDB_GORSEL}/w92${logoPath}`);

export type IcerikTipi = "film" | "dizi";

export type PosterOge = {
    id: number;
    tip: IcerikTipi;
    baslik: string;
    posterPath: string;
    yil: number | null;
    puan: number;
};

// Liste/şerit kartları için içerik özeti
export type IcerikKarti = {
    id: number;
    tip: IcerikTipi;
    baslik: string;
    posterPath: string | null;
    arkaPlanPath: string | null;
    yil: number | null;
    puan: number;
    ozet: string;
    turIds: number[];
};

export const icerikYolu = (o: { tip: IcerikTipi; id: number }) => `/${o.tip}/${o.id}`;
