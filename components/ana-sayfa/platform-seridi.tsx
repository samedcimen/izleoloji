"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { IcerikKarti } from "@/lib/tmdb/gorsel";
import { Serit } from "@/components/icerik/serit";
import { PosterKarti } from "@/components/icerik/poster-karti";

type Platform = { id: number; ad: string; icerikler: IcerikKarti[] };

// Platform seçmeli "yeni eklenenler" şeridi; tüm platformların verisi sunucudan hazır gelir
export function PlatformSeridi({ platformlar }: { platformlar: Platform[] }) {
    const [secili, setSecili] = useState(0);
    if (platformlar.length === 0) return null;
    const p = platformlar[secili] ?? platformlar[0];

    return (
        <section>
            <div className="mb-4 flex flex-col gap-3 px-4 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h2 className="text-lg font-bold tracking-tight sm:text-xl">Platformlarda yeni</h2>
                    <p className="mt-0.5 text-sm text-white/50">Türkiye kataloğuna son eklenen film ve diziler</p>
                </div>
                <div
                    className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
                    role="tablist"
                    aria-label="Platform"
                >
                    {platformlar.map((x, i) => (
                        <button
                            key={x.id}
                            type="button"
                            role="tab"
                            aria-selected={i === secili}
                            onClick={() => setSecili(i)}
                            className={cn(
                                "flex shrink-0 items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-xs font-semibold transition",
                                i === secili ? "border-violet-400/60 bg-violet-500/20 text-white" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
                            )}
                        >
                            <Image src={`/logo/${x.id}.jpg`} alt="" width={22} height={22} className="rounded-full" />
                            {x.ad}
                        </button>
                    ))}
                </div>
            </div>
            <Serit baslik={<span className="sr-only">{p.ad}</span>} className="[&>div:first-child]:mb-0">
                {p.icerikler.map((o) => (
                    <PosterKarti key={`${p.id}-${o.tip}-${o.id}`} icerik={o} />
                ))}
            </Serit>
        </section>
    );
}
