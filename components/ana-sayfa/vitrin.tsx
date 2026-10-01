"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Info, Play, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { arkaPlanUrl, icerikYolu, logoUrl, posterUrl } from "@/lib/tmdb/gorsel";
import type { VitrinOge } from "@/lib/tmdb/ana-sayfa";
import { FragmanPenceresi } from "./fragman-penceresi";

const SURE_MS = 8000;

// Üstteki dönen vitrin: haftanın 5 trendi. 8 sn'de bir değişir; fare üstündeyken,
// fragman açıkken ve "hareketi azalt" açıksa durur.
export function Vitrin({ ogeler }: { ogeler: VitrinOge[] }) {
    const [sira, setSira] = useState(0);
    const [durdu, setDurdu] = useState(false);
    const [fragman, setFragman] = useState(false);

    useEffect(() => {
        if (durdu || fragman || ogeler.length < 2) return;
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const z = setTimeout(() => setSira((s) => (s + 1) % ogeler.length), SURE_MS);
        return () => clearTimeout(z);
    }, [sira, durdu, fragman, ogeler.length]);

    if (ogeler.length === 0) return null;
    const o = ogeler[sira];

    return (
        <section
            className="relative isolate h-[78svh] min-h-[520px] max-h-[820px] w-full overflow-hidden"
            onMouseEnter={() => setDurdu(true)}
            onMouseLeave={() => setDurdu(false)}
            aria-roledescription="carousel"
            aria-label="Bu haftanın öne çıkanları"
        >
            {/* Arka planlar üst üste; seçili olan görünür (yumuşak geçiş) */}
            {ogeler.map((v, i) => (
                <div
                    key={`${v.tip}-${v.id}`}
                    className={cn("absolute inset-0 -z-10 transition-opacity duration-1000", i === sira ? "opacity-100" : "opacity-0")}
                    aria-hidden={i !== sira}
                >
                    {v.arkaPlanPath && (
                        <Image
                            src={arkaPlanUrl(v.arkaPlanPath)}
                            alt=""
                            fill
                            unoptimized
                            priority={i === 0}
                            loading={i === 0 ? "eager" : "lazy"}
                            className={cn("object-cover object-top", i === sira && "animate-[vitrinYakinlas_9s_ease-out_forwards]")}
                        />
                    )}
                </div>
            ))}
            <div className="absolute inset-0 -z-10 bg-linear-to-r from-background/95 via-background/45 to-transparent" />
            <div className="absolute inset-0 -z-10 bg-linear-to-t from-background via-transparent to-black/30" />

            <div key={sira} className="flex h-full flex-col justify-end px-4 pb-24 sm:px-8">
                <div className="max-w-2xl animate-[vitrinBelir_0.7s_ease-out]">
                    <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/15 px-3 py-1 text-xs font-bold text-violet-200 backdrop-blur">
                        #{sira + 1} Bu hafta trend · {o.tip === "film" ? "Film" : "Dizi"}
                    </span>

                    {o.logoPath ? (
                        <h1 className="mb-5">
                            <span className="sr-only">{o.baslik}</span>
                            <Image
                                src={logoUrl(o.logoPath)}
                                alt=""
                                width={500}
                                height={200}
                                unoptimized
                                className="h-auto max-h-32 w-auto max-w-[80%] object-contain object-left drop-shadow-[0_4px_24px_rgb(0_0_0/0.6)] sm:max-h-40"
                            />
                        </h1>
                    ) : (
                        <h1 className="mb-4 text-4xl font-black leading-[1.05] tracking-tight drop-shadow-lg sm:text-6xl">{o.baslik}</h1>
                    )}

                    <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80">
                        {o.puan > 0 && (
                            <span className="flex items-center gap-1 font-semibold text-white">
                                <Star className="size-4 fill-amber-400 text-amber-400" />
                                {o.puan.toFixed(1)}
                            </span>
                        )}
                        {o.yil && <span>{o.yil}</span>}
                        {o.sure && <span>{o.sure}</span>}
                        {o.turAdlari.length > 0 && <span className="text-white/60">{o.turAdlari.join(" · ")}</span>}
                    </div>

                    {o.ozet && <p className="mb-7 line-clamp-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">{o.ozet}</p>}

                    <div className="flex flex-wrap gap-3">
                        {o.fragmanKey && (
                            <button
                                type="button"
                                onClick={() => setFragman(true)}
                                className="flex h-12 items-center gap-2 rounded-full bg-white px-6 font-bold text-black transition hover:bg-white/85 active:scale-[0.98]"
                            >
                                <Play className="size-5 fill-current" />
                                Fragmanı izle
                            </button>
                        )}
                        <Link
                            href={icerikYolu(o)}
                            className="flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-[0.98]"
                        >
                            <Info className="size-5" />
                            Detaylar
                        </Link>
                    </div>
                </div>
            </div>

            {/* Küçük posterlerle seçim (masaüstü) ve noktalar (mobil) */}
            <div className="absolute bottom-6 right-8 hidden gap-2.5 lg:flex">
                {ogeler.map((v, i) => (
                    <button
                        key={`${v.tip}-${v.id}`}
                        type="button"
                        onClick={() => setSira(i)}
                        aria-label={`${i + 1}. öne çıkan: ${v.baslik}`}
                        aria-current={i === sira}
                        className={cn(
                            "relative h-24 w-16 overflow-hidden rounded-lg ring-2 transition duration-300",
                            i === sira ? "scale-110 ring-violet-400" : "opacity-55 ring-transparent hover:opacity-100",
                        )}
                    >
                        {v.posterPath && <Image src={posterUrl(v.posterPath, "w185")} alt="" fill unoptimized className="object-cover" />}
                        {i === sira && !durdu && !fragman && (
                            <span key={sira} className="absolute inset-x-0 bottom-0 h-1 origin-left animate-[vitrinIlerle_8s_linear_forwards] bg-violet-400" />
                        )}
                    </button>
                ))}
            </div>
            <div className="absolute bottom-14 left-1/2 flex -translate-x-1/2 gap-2 lg:hidden">
                {ogeler.map((v, i) => (
                    <button
                        key={`${v.tip}-${v.id}`}
                        type="button"
                        onClick={() => setSira(i)}
                        aria-label={`${i + 1}. öne çıkan: ${v.baslik}`}
                        className={cn("h-1.5 rounded-full transition-all", i === sira ? "w-6 bg-violet-400" : "w-1.5 bg-white/40")}
                    />
                ))}
            </div>

            <FragmanPenceresi baslik={o.baslik} youtubeKey={o.fragmanKey} acik={fragman} kapat={() => setFragman(false)} />
        </section>
    );
}
