import type { Metadata } from "next";
import Link from "next/link";
import { Clapperboard, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { oturumAl } from "@/lib/oturum";
import { posterHavuzu } from "@/lib/tmdb/trend";
import { PosterDuvari } from "@/components/giris-ekrani/poster-duvari";
import { GeriButonu } from "@/components/site/geri-butonu";
import { UygulamaIskeleti } from "@/components/site/uygulama-iskeleti";

export const metadata: Metadata = { title: "Sayfa bulunamadı" };

// Bulunamayan tüm adresler ve notFound() çağrıları; henüz yapılmamış sayfalar da buraya düşer.
// Giriş yapmış kullanıcı yan menülü iskeletin içinde görür (siteden atılmış hissi olmasın);
// misafir tam ekran poster duvarının önünde. Kök not-found route group layout'unu almadığı
// için iskelet burada çiziliyor.
export default async function BulunamadiSayfasi() {
    const oturum = await oturumAl();

    if (oturum?.user) {
        return (
            <UygulamaIskeleti kullanici={oturum.user}>
                <main className="relative isolate flex flex-1 items-center justify-center overflow-hidden px-4 pb-12 pt-24 lg:pt-12">
                    <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 -z-10 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-3xl" />
                    <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 -z-10 size-80 rounded-full bg-fuchsia-600/10 blur-3xl" />
                    <BulunamadiKarti />
                </main>
            </UygulamaIskeleti>
        );
    }

    const havuz = await posterHavuzu().catch(() => []);
    return (
        <main className="relative isolate flex min-h-dvh flex-1 flex-col items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground">
            <PosterDuvari havuz={havuz} />
            <BulunamadiKarti cam />
        </main>
    );
}

// cam: poster duvarının önünde buzlu cam kart; iskelet içinde zeminsiz
function BulunamadiKarti({ cam }: { cam?: boolean }) {
    return (
        <div
            className={cn(
                "relative z-10 w-full max-w-lg text-center",
                cam && "rounded-3xl border border-white/10 bg-[#0c0a14]/70 p-8 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9),0_0_0_1px_rgb(167_139_250/0.08)_inset] backdrop-blur-xl sm:p-10",
            )}
        >
            <p aria-hidden className="flex items-center justify-center gap-1 text-[6.5rem] font-black leading-none tracking-tighter sm:text-[8rem]">
                <span className="bg-linear-to-b from-white to-white/40 bg-clip-text text-transparent">4</span>
                <span className="grid size-[5.5rem] place-items-center rounded-full bg-linear-to-br from-violet-600 to-fuchsia-600 shadow-[0_10px_40px_-8px_rgb(168_85_247/0.8)] sm:size-28">
                    <Clapperboard className="size-11 text-white sm:size-14" strokeWidth={1.75} />
                </span>
                <span className="bg-linear-to-b from-white to-white/40 bg-clip-text text-transparent">4</span>
            </p>

            <h1 className="mt-6 text-2xl font-black tracking-tight sm:text-3xl">Bu sahne kurgudan çıkarılmış</h1>
            <p className="mt-3 text-sm leading-relaxed text-white/60 sm:text-base">
                Aradığın sayfa ya hiç çekilmedi ya da şu an yapım aşamasında. Adresi kontrol et ya da ana sayfadan devam et.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                    href="/"
                    className="flex h-12 items-center justify-center gap-2 rounded-full bg-linear-to-br from-violet-700 to-violet-500 px-6 font-bold text-white shadow-[0_8px_30px_-6px_rgb(124_58_237/0.7)] transition hover:brightness-110 active:scale-[0.98]"
                >
                    <Home className="size-4" />
                    Ana sayfaya dön
                </Link>
                <GeriButonu />
            </div>
        </div>
    );
}
