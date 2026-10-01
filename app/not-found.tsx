import type { Metadata } from "next";
import Link from "next/link";
import { Clapperboard, Home } from "lucide-react";
import { posterHavuzu } from "@/lib/tmdb/trend";
import { PosterDuvari } from "@/components/giris-ekrani/poster-duvari";
import { GeriButonu } from "@/components/site/geri-butonu";

export const metadata: Metadata = { title: "Sayfa bulunamadı" };

// Bulunamayan tüm adresler ve notFound() çağrıları. Henüz yapılmamış sayfalar da buraya düşer.
export default async function BulunamadiSayfasi() {
    const havuz = await posterHavuzu().catch(() => []);

    return (
        <main className="relative isolate flex min-h-dvh flex-1 flex-col items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground">
            <PosterDuvari havuz={havuz} />

            <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-[#0c0a14]/70 p-8 text-center shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9),0_0_0_1px_rgb(167_139_250/0.08)_inset] backdrop-blur-xl sm:p-10">
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
        </main>
    );
}
