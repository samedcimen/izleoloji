"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Yatay kaydırmalı şerit: dokunmatikte parmakla, masaüstünde oklarla kayar.
// Kartlar CSS scroll-snap ile hizalanır; kütüphane yok.
export function Serit({ baslik, aciklama, sag, children, className }: {
    baslik: React.ReactNode;
    aciklama?: React.ReactNode;
    sag?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    const kap = useRef<HTMLDivElement>(null);
    const [solVar, setSolVar] = useState(false);
    const [sagVar, setSagVar] = useState(false);

    const guncelle = useCallback(() => {
        const el = kap.current;
        if (!el) return;
        setSolVar(el.scrollLeft > 8);
        setSagVar(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    }, []);

    useEffect(() => {
        const el = kap.current;
        if (!el) return;
        const izle = new ResizeObserver(guncelle);
        izle.observe(el);
        return () => izle.disconnect();
    }, [guncelle, children]);

    const kaydir = (yon: 1 | -1) => {
        const el = kap.current;
        if (el) el.scrollBy({ left: yon * el.clientWidth * 0.85, behavior: "smooth" });
    };

    return (
        <section className={cn("group/serit", className)}>
            <div className="mb-3 flex items-end justify-between gap-4 px-4 sm:px-8">
                <div>
                    <h2 className="text-lg font-bold tracking-tight sm:text-xl">{baslik}</h2>
                    {aciklama && <p className="mt-0.5 text-sm text-foreground/55">{aciklama}</p>}
                </div>
                {sag}
            </div>
            <div className="relative">
                <div
                    ref={kap}
                    onScroll={guncelle}
                    className="flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:scroll-px-8 sm:gap-4 sm:px-8 [&::-webkit-scrollbar]:hidden"
                >
                    {children}
                </div>
                <OkButonu yon="sol" gorunur={solVar} onClick={() => kaydir(-1)} />
                <OkButonu yon="sag" gorunur={sagVar} onClick={() => kaydir(1)} />
            </div>
        </section>
    );
}

function OkButonu({ yon, gorunur, onClick }: { yon: "sol" | "sag"; gorunur: boolean; onClick: () => void }) {
    const Ikon = yon === "sol" ? ChevronLeft : ChevronRight;
    return (
        <button
            type="button"
            onClick={onClick}
            tabIndex={gorunur ? 0 : -1}
            aria-label={yon === "sol" ? "Geri kaydır" : "İleri kaydır"}
            className={cn(
                "absolute top-[38%] z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/70 text-white opacity-0 shadow-lg backdrop-blur transition hover:bg-violet-600 md:grid",
                yon === "sol" ? "left-3" : "right-3",
                gorunur ? "group-hover/serit:opacity-100 focus-visible:opacity-100" : "pointer-events-none",
            )}
        >
            <Ikon className="size-5" />
        </button>
    );
}
