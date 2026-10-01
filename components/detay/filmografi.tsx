"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { icerikYolu, posterUrl, type IcerikKarti } from "@/lib/tmdb/gorsel";

type Is = IcerikKarti & { rol: string };

const ILK_GOSTERIM = 24;

// Oyuncunun film/dizi listesi: sekmeli, yeniden eskiye, rolüyle birlikte
export function Filmografi({ filmler, diziler }: { filmler: Is[]; diziler: Is[] }) {
    const [sekme, setSekme] = useState<"film" | "dizi">(filmler.length >= diziler.length ? "film" : "dizi");
    const [hepsi, setHepsi] = useState(false);
    const liste = sekme === "film" ? filmler : diziler;
    if (filmler.length + diziler.length === 0) return null;

    return (
        <section className="px-4 sm:px-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold tracking-tight sm:text-xl">Filmografi</h2>
                <div className="flex gap-2" role="tablist">
                    {(["film", "dizi"] as const).map((s) => (
                        <button
                            key={s}
                            type="button"
                            role="tab"
                            aria-selected={sekme === s}
                            onClick={() => { setSekme(s); setHepsi(false); }}
                            className={cn(
                                "rounded-full border px-4 py-1.5 text-sm font-semibold transition",
                                sekme === s ? "border-violet-400/60 bg-violet-500/20 text-white" : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white",
                            )}
                        >
                            {s === "film" ? "Filmler" : "Diziler"} <span className="ml-1 text-xs font-normal opacity-60">{(s === "film" ? filmler : diziler).length}</span>
                        </button>
                    ))}
                </div>
            </div>

            {liste.length === 0 ? (
                <p className="text-sm text-foreground/50">Kayıtlı {sekme === "film" ? "film" : "dizi"} yok.</p>
            ) : (
                <>
                    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {(hepsi ? liste : liste.slice(0, ILK_GOSTERIM)).map((o) => (
                            <li key={`${o.tip}-${o.id}`}>
                                <Link href={icerikYolu(o)} className="group flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-2 transition hover:border-violet-400/30 hover:bg-white/[0.06]">
                                    <div className="relative aspect-2/3 w-14 shrink-0 overflow-hidden rounded-lg bg-white/5">
                                        {o.posterPath && <Image src={posterUrl(o.posterPath, "w185")} alt="" fill unoptimized sizes="56px" className="object-cover" />}
                                    </div>
                                    <div className="min-w-0 py-1">
                                        <p className="line-clamp-1 text-sm font-semibold transition group-hover:text-violet-300">{o.baslik}</p>
                                        {o.rol && <p className="line-clamp-1 text-xs text-foreground/50">{o.rol}</p>}
                                        <p className="mt-1 flex items-center gap-2 text-xs text-foreground/45">
                                            {o.yil ?? "Yakında"}
                                            {o.puan > 0 && <span className="flex items-center gap-0.5"><Star className="size-3 fill-amber-400 text-amber-400" />{o.puan.toFixed(1)}</span>}
                                        </p>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                    {!hepsi && liste.length > ILK_GOSTERIM && (
                        <button type="button" onClick={() => setHepsi(true)} className="mt-4 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold transition hover:bg-white/10">
                            Tümünü göster ({liste.length})
                        </button>
                    )}
                </>
            )}
        </section>
    );
}
