"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import type { IcerikKarti } from "@/lib/tmdb/gorsel";
import { KESIF_TURLERI } from "@/lib/tmdb/turler";
import { turSec } from "@/app/actions/kesif";
import { Serit } from "@/components/icerik/serit";
import { PosterKarti, PosterKartiIskelet } from "@/components/icerik/poster-karti";

// Tür seçince o türün popüler film ve dizileri gelir; ilk türün verisi sunucudan hazır gelir
export function TurSeridi({ ilkIcerikler }: { ilkIcerikler: IcerikKarti[] }) {
    const [secili, setSecili] = useState(0);
    const [icerikler, setIcerikler] = useState(ilkIcerikler);
    const [yukleniyor, baslat] = useTransition();

    const sec = (i: number) => {
        if (i === secili) return;
        setSecili(i);
        baslat(async () => setIcerikler(await turSec(i)));
    };

    return (
        <section>
            <div className="mb-4 px-4 sm:px-8">
                <h2 className="text-lg font-bold tracking-tight sm:text-xl">Türe göre keşfet</h2>
                <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden" role="tablist">
                    {KESIF_TURLERI.map((t, i) => (
                        <button
                            key={t.ad}
                            type="button"
                            role="tab"
                            aria-selected={i === secili}
                            onClick={() => sec(i)}
                            className={cn(
                                "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
                                i === secili ? "border-violet-400/60 bg-violet-500/20 text-foreground" : "border-foreground/10 bg-foreground/5 text-foreground/65 hover:bg-foreground/10 hover:text-foreground",
                            )}
                        >
                            <span aria-hidden>{t.emoji}</span>
                            {t.ad}
                        </button>
                    ))}
                </div>
            </div>
            <Serit baslik={<span className="sr-only">{KESIF_TURLERI[secili].ad}</span>} className="[&>div:first-child]:mb-0">
                {yukleniyor
                    ? Array.from({ length: 8 }, (_, i) => <PosterKartiIskelet key={i} />)
                    : icerikler.map((o) => <PosterKarti key={`${o.tip}-${o.id}`} icerik={o} />)}
            </Serit>
        </section>
    );
}
