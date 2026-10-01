import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { platformLogoUrl, posterUrl } from "@/lib/tmdb/gorsel";
import type { Platform, Platformlar } from "@/lib/tmdb/detay";

export type Bilgi = { etiket: string; deger: React.ReactNode };

// Poster + konu + künye + platformlar
export function BilgiBolumu({ baslik, posterPath, ozet, bilgiler, platformlar }: {
    baslik: string;
    posterPath: string | null;
    ozet: string;
    bilgiler: Bilgi[];
    platformlar: Platformlar | null;
}) {
    return (
        <section className="grid gap-8 px-4 sm:px-8 md:grid-cols-[13rem_1fr] lg:grid-cols-[15rem_1fr] lg:gap-12">
            <div className="hidden md:block">
                <div className="relative aspect-2/3 overflow-hidden rounded-2xl bg-white/5 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.9)] ring-1 ring-white/10 md:-mt-24">
                    {posterPath && <Image src={posterUrl(posterPath, "w500")} alt={baslik} fill unoptimized sizes="240px" className="object-cover" />}
                </div>
            </div>

            <div className="min-w-0 space-y-8">
                <div>
                    <h2 className="mb-2 text-lg font-bold">Konusu</h2>
                    <p className="max-w-3xl leading-relaxed text-foreground/75">{ozet || "Bu içerik için henüz bir açıklama girilmemiş."}</p>
                </div>

                {bilgiler.length > 0 && (
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 xl:grid-cols-4">
                        {bilgiler.map((b) => (
                            <div key={b.etiket} className="min-w-0">
                                <dt className="text-xs font-semibold uppercase tracking-wider text-foreground/40">{b.etiket}</dt>
                                <dd className="mt-1 text-sm font-medium text-foreground/90">{b.deger}</dd>
                            </div>
                        ))}
                    </dl>
                )}

                {platformlar && <PlatformKutusu p={platformlar} />}
            </div>
        </section>
    );
}

function PlatformKutusu({ p }: { p: Platformlar }) {
    const gruplar: [string, Platform[]][] = [["Abonelikle", p.abonelik], ["Kirala", p.kirala], ["Satın al", p.satinAl]];
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold">Nerede izlenir?</h2>
                {p.link && (
                    <a href={p.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-foreground/45 transition hover:text-violet-300">
                        JustWatch <ExternalLink className="size-3" />
                    </a>
                )}
            </div>
            <div className="space-y-4">
                {gruplar.filter(([, l]) => l.length > 0).map(([ad, liste]) => (
                    <div key={ad} className="flex flex-wrap items-center gap-3">
                        <span className="w-20 shrink-0 text-xs font-semibold text-foreground/45">{ad}</span>
                        {liste.map((s) => (
                            <span key={s.id} title={s.ad} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 text-xs font-semibold">
                                <Image src={platformLogoUrl(s.id, s.logoPath)} alt="" width={24} height={24} unoptimized className="rounded-full" />
                                {s.ad}
                            </span>
                        ))}
                    </div>
                ))}
            </div>
            <p className="mt-4 text-[11px] text-foreground/35">Türkiye için. Platform bilgileri JustWatch kaynaklıdır.</p>
        </div>
    );
}

// Künyede kişi adlarını oyuncu sayfasına bağlar
export function KisiBaglantilari({ kisiler }: { kisiler: { id: number; ad: string }[] }) {
    return (
        <>
            {kisiler.map((k, i) => (
                <span key={k.id}>
                    {i > 0 && ", "}
                    <Link href={`/oyuncu/${k.id}`} className="transition hover:text-violet-300 hover:underline">
                        {k.ad}
                    </Link>
                </span>
            ))}
        </>
    );
}
