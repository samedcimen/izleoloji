import "server-only";
import { env } from "@/lib/env";

const BASE = "https://api.themoviedb.org/3";

// TMDB görselleri kendi CDN'inden hazır boyutlarda gelir; Vercel'in görsel
// optimizasyon kotasını harcamamak için doğrudan bu boyutlar kullanılır.
export const TMDB_GORSEL = "https://image.tmdb.org/t/p";
export const posterUrl = (yol: string, boyut: "w185" | "w342" | "w500" = "w342") => `${TMDB_GORSEL}/${boyut}${yol}`;

export async function tmdbFetch<T>(yol: string, params: Record<string, string> = {}, revalidate = 3600): Promise<T> {
    if (!env.TMDB_API_KEY) throw new Error("TMDB_API_KEY tanımlı değil.");

    const url = new URL(`${BASE}${yol}`);
    url.search = new URLSearchParams({ language: "tr-TR", ...params }).toString();

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${env.TMDB_API_KEY}` },
        next: { revalidate },
    });
    if (!res.ok) throw new Error(`TMDB ${yol}: ${res.status}`);
    return res.json() as Promise<T>;
}
