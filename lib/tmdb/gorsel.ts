// Hem sunucu hem tarayıcı tarafında kullanılabilen TMDB görsel yardımcıları ve tipleri.

// TMDB görselleri kendi CDN'inden hazır boyutlarda gelir; Vercel'in görsel
// optimizasyon kotasını harcamamak için doğrudan bu boyutlar kullanılır.
export const TMDB_GORSEL = "https://image.tmdb.org/t/p";

export const posterUrl = (yol: string, boyut: "w185" | "w342" | "w500" = "w342") => `${TMDB_GORSEL}/${boyut}${yol}`;

export type PosterOge = {
    id: number;
    tip: "film" | "dizi";
    baslik: string;
    posterPath: string;
    yil: number | null;
    puan: number;
};
