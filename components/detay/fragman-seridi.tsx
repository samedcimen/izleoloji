"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { Fragman } from "@/lib/tmdb/detay";
import { Serit } from "@/components/icerik/serit";
import { FragmanPenceresi } from "@/components/ana-sayfa/fragman-penceresi";

// YouTube küçük resimleriyle fragman şeridi; tıklayınca pencerede oynar
export function FragmanSeridi({ baslik, fragmanlar }: { baslik: string; fragmanlar: Fragman[] }) {
    const [acik, setAcik] = useState<Fragman | null>(null);
    if (fragmanlar.length === 0) return null;

    return (
        <>
            <Serit baslik="Fragmanlar">
                {fragmanlar.map((f) => (
                    <button key={f.key} type="button" onClick={() => setAcik(f)} className="group w-64 shrink-0 snap-start text-left sm:w-72">
                        <div className="relative aspect-video overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 transition group-hover:ring-violet-400/70">
                            <Image src={`https://i.ytimg.com/vi/${f.key}/hqdefault.jpg`} alt="" fill unoptimized sizes="288px" className="object-cover transition duration-500 group-hover:scale-105" />
                            <span className="absolute inset-0 grid place-items-center bg-black/30 transition group-hover:bg-black/10">
                                <span className="grid size-12 place-items-center rounded-full bg-white/90 text-black shadow-lg transition group-hover:scale-110">
                                    <Play className="ml-0.5 size-5 fill-current" />
                                </span>
                            </span>
                            <span className="absolute left-2 top-2 rounded-full bg-black/65 px-2 py-0.5 text-[11px] font-semibold text-white">{f.tur}</span>
                        </div>
                        <p className="mt-2 line-clamp-1 text-sm font-medium text-foreground/80 transition group-hover:text-violet-300">{f.ad}</p>
                    </button>
                ))}
            </Serit>
            <FragmanPenceresi baslik={baslik} youtubeKey={acik?.key ?? null} acik={!!acik} kapat={() => setAcik(null)} />
        </>
    );
}
