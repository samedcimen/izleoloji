import type { Metadata } from "next";
import { auth } from "@/auth";
import { proje } from "@/lib/ayarlar/proje";
import { posterHavuzu } from "@/lib/tmdb/trend";
import { PosterDuvari } from "@/components/giris-ekrani/poster-duvari";
import { KarsilamaKarti } from "@/components/giris-ekrani/karsilama-karti";

export const metadata: Metadata = {
    title: { absolute: `${proje.baslik} — ${proje.baslik2}` },
};

export default async function AnaSayfa() {
    // Oturuma göre değiştiği için sayfa her istekte oluşur; TMDB verisi yine 6 saatlik önbellekten gelir
    // auth() hata verirse (ör. AUTH_SECRET eksik) sayfa çökmesin, misafir olarak gösterilsin
    const [havuz, oturum] = await Promise.all([posterHavuzu().catch(() => []), auth().catch(() => null)]);
    const kullanici = oturum?.user
        ? { ad: oturum.user.name ?? null, kullaniciAdi: oturum.user.username, resim: oturum.user.image ?? null }
        : undefined;

    return (
        <main className="relative isolate flex min-h-dvh flex-1 flex-col items-center justify-end overflow-hidden px-4 pb-10 sm:justify-center sm:pb-0">
            <PosterDuvari havuz={havuz} />
            <KarsilamaKarti kullanici={kullanici} />
            <p className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 text-[10px] text-white/30">
                Film ve dizi verileri TMDB&apos;den sağlanır.
            </p>
        </main>
    );
}
