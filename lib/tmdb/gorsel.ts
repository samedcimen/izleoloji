// Hem sunucu hem tarayıcı tarafında kullanılabilen TMDB görsel yardımcıları ve tipleri.

// TMDB görselleri kendi CDN'inden hazır boyutlarda gelir; Vercel'in görsel
// optimizasyon kotasını harcamamak için doğrudan bu boyutlar kullanılır.
export const TMDB_GORSEL = "https://image.tmdb.org/t/p";

export const posterUrl = (yol: string, boyut: "w185" | "w342" | "w500" = "w342") => `${TMDB_GORSEL}/${boyut}${yol}`;
export const arkaPlanUrl = (yol: string, boyut: "w780" | "w1280" | "original" = "w1280") => `${TMDB_GORSEL}/${boyut}${yol}`;
export const logoUrl = (yol: string, boyut: "w300" | "w500" = "w500") => `${TMDB_GORSEL}/${boyut}${yol}`;

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
