import type { Metadata } from "next";
import { oturumAl } from "@/lib/oturum";
import { proje } from "@/lib/ayarlar/proje";
import { posterHavuzu } from "@/lib/tmdb/trend";
import { PosterDuvari } from "@/components/giris-ekrani/poster-duvari";
import { KarsilamaKarti } from "@/components/giris-ekrani/karsilama-karti";
import { GirisliAnaSayfa } from "@/components/ana-sayfa/girisli-ana-sayfa";

export const metadata: Metadata = {
    title: { absolute: `${proje.baslik} — ${proje.baslik2}` },
};

// Giriş yapan kullanıcı vitrinli ana sayfayı, misafir poster duvarlı karşılama ekranını görür.
export default async function AnaSayfa() {
    const oturum = await oturumAl();
    if (oturum?.user) return <GirisliAnaSayfa />;

    const havuz = await posterHavuzu().catch(() => []);
    return (
        <main className="relative isolate flex min-h-dvh flex-1 flex-col items-center justify-end overflow-hidden bg-background px-4 pb-10 text-foreground sm:justify-center sm:pb-0">
            <PosterDuvari havuz={havuz} />
            <KarsilamaKarti />
            <p className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 text-[10px] text-white/30">
                Film ve dizi verileri TMDB&apos;den sağlanır.
            </p>
        </main>
    );
}
