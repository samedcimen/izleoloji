import type { Metadata } from "next";
import { proje } from "@/lib/ayarlar/proje";
import { posterDuvariIcerikleri } from "@/lib/tmdb/trend";
import { PosterDuvari } from "@/components/giris-ekrani/poster-duvari";
import { KarsilamaKarti } from "@/components/giris-ekrani/karsilama-karti";

// Trendler 6 saatte bir yenilenir; arada sayfa önbellekten sunulur
export const revalidate = 21600;

export const metadata: Metadata = {
    title: { absolute: `${proje.baslik} — ${proje.baslik2}` },
};

export default async function AnaSayfa() {
    const icerikler = await posterDuvariIcerikleri().catch(() => []);

    return (
        <main className="relative isolate flex min-h-dvh flex-1 flex-col items-center justify-end overflow-hidden px-4 pb-10 sm:justify-center sm:pb-0">
            <PosterDuvari icerikler={icerikler} />
            <KarsilamaKarti />
            <p className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 text-[10px] text-white/30">
                Film ve dizi verileri TMDB&apos;den sağlanır.
            </p>
        </main>
    );
}
