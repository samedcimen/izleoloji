import { posterHavuzu } from "@/lib/tmdb/trend";
import { PosterDuvari } from "@/components/giris-ekrani/poster-duvari";

// Giriş, kayıt ve şifre sayfaları: ana sayfadaki poster duvarının önünde, koyu temada.
// Poster verisi TMDB fetch önbelleğinden gelir (6 saatte bir yenilenir).
export default async function OturumDuzeni({ children }: LayoutProps<"/">) {
    const havuz = await posterHavuzu().catch(() => []);

    return (
        <main className="relative isolate flex min-h-dvh flex-1 flex-col items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground">
            <PosterDuvari havuz={havuz} />
            {children}
        </main>
    );
}
