"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import type { IcerikKarti } from "@/lib/tmdb/gorsel";
import { listeOgesiDegistir } from "@/app/actions/liste";
import { PosterKarti, type KartDurumu } from "@/components/icerik/poster-karti";

// Liste içerikleri ızgarası. listeId verilirse (listenin sahibi) her kartta "listeden çıkar" var.
export function IcerikIzgarasi({ kartlar, durumlar, listeId, bosMetin }: {
    kartlar: IcerikKarti[];
    durumlar?: Record<string, KartDurumu>;
    listeId?: string;
    bosMetin: string;
}) {
    const [gizlenen, setGizlenen] = useState<Set<string>>(new Set());
    const [, baslat] = useTransition();
    const gorunen = kartlar.filter((k) => !gizlenen.has(`${k.tip}-${k.id}`));

    if (gorunen.length === 0) {
        return <p className="rounded-2xl border border-dashed border-white/15 px-6 py-14 text-center text-foreground/50">{bosMetin}</p>;
    }

    const cikar = (k: IcerikKarti) => {
        const a = `${k.tip}-${k.id}`;
        setGizlenen((g) => new Set(g).add(a));
        baslat(async () => {
            const r = await listeOgesiDegistir(listeId!, k.tip, k.id, false);
            if (r.hata) setGizlenen((g) => { const y = new Set(g); y.delete(a); return y; });
        });
    };

    return (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-x-4 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))]">
            {gorunen.map((k) => (
                <li key={`${k.tip}-${k.id}`} className="group/oge relative">
                    <PosterKarti icerik={k} durum={durumlar?.[`${k.tip}-${k.id}`]} className="w-full" />
                    {listeId && (
                        <div className="pointer-events-none absolute inset-x-0 top-0 aspect-2/3">
                            <button
                                type="button"
                                onClick={() => cikar(k)}
                                aria-label={`${k.baslik} listeden çıkar`}
                                title="Listeden çıkar"
                                className="pointer-events-auto absolute bottom-2 right-2 grid size-8 place-items-center rounded-full bg-black/70 text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-red-500 lg:opacity-0 lg:focus-visible:opacity-100 lg:group-hover/oge:opacity-100"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
}
