import "server-only";
import { env } from "@/lib/env";

const BASE = "https://api.themoviedb.org/3";
const ZAMAN_ASIMI_MS = 8000;
const DENEME = 3;

// TMDB isteği: zaman aşımı + 429/5xx'te kısa bekleyip tekrar deneme.
// Yanıt Next'in fetch önbelleğinde `revalidate` saniye tutulur.
export async function tmdbFetch<T>(yol: string, params: Record<string, string> = {}, revalidate = 3600): Promise<T> {
    if (!env.TMDB_API_KEY) throw new Error("TMDB_API_KEY tanımlı değil.");

    const url = new URL(`${BASE}${yol}`);
    url.search = new URLSearchParams({ language: "tr-TR", ...params }).toString();

    for (let deneme = 1; ; deneme++) {
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${env.TMDB_API_KEY}` },
            next: { revalidate },
            signal: AbortSignal.timeout(ZAMAN_ASIMI_MS),
        });
        if (res.ok) return res.json() as Promise<T>;

        const tekrarlanabilir = res.status === 429 || res.status >= 500;
        if (!tekrarlanabilir || deneme >= DENEME) throw new Error(`TMDB ${yol}: ${res.status}`);

        // TMDB 429'da ne kadar bekleneceğini Retry-After ile söyler
        const bekle = Number(res.headers.get("retry-after")) * 1000 || 400 * deneme;
        await new Promise((r) => setTimeout(r, bekle));
    }
}
