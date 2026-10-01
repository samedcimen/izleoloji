"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { CalendarDays, Clock, ImageOff, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { sureMetni, tarihMetni } from "@/lib/bicim";
import { bolumGorselUrl } from "@/lib/tmdb/gorsel";
import type { SezonDetay, SezonOzet } from "@/lib/tmdb/detay";
import { sezonGetir } from "@/app/actions/icerik";

// Sezon seçici + bölüm listesi. İlk gösterilen sezonun bölümleri sunucudan hazır gelir.
export function Sezonlar({ diziId, sezonlar, ilkSezon }: { diziId: number; sezonlar: SezonOzet[]; ilkSezon: SezonDetay | null }) {
    const [secili, setSecili] = useState(ilkSezon?.no ?? sezonlar[0]?.no ?? 1);
    const [sezon, setSezon] = useState(ilkSezon);
    const [yukleniyor, baslat] = useTransition();

    if (sezonlar.length === 0) return null;

    const sec = (no: number) => {
        if (no === secili) return;
        setSecili(no);
        baslat(async () => setSezon(await sezonGetir(diziId, no)));
    };

    return (
        <section className="px-4 sm:px-8">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-lg font-bold tracking-tight sm:text-xl">Sezonlar ve bölümler</h2>
                <span className="text-sm text-foreground/50">{sezonlar.length} sezon</span>
            </div>

            <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Sezon">
                {sezonlar.map((s) => (
                    <button
                        key={s.no}
                        type="button"
                        role="tab"
                        aria-selected={s.no === secili}
                        onClick={() => sec(s.no)}
                        className={cn(
                            "shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition",
                            s.no === secili ? "border-violet-400/60 bg-violet-500/20 text-white" : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white",
                        )}
                    >
                        {s.no === 0 ? "Özel" : `${s.no}. Sezon`}
                        <span className="ml-1.5 text-xs font-normal opacity-60">{s.bolumSayisi}</span>
                    </button>
                ))}
            </div>

            {yukleniyor ? (
                <div className="space-y-3">{Array.from({ length: 4 }, (_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5" />)}</div>
            ) : !sezon || sezon.bolumler.length === 0 ? (
                <p className="rounded-2xl border border-white/10 p-6 text-center text-sm text-foreground/50">Bu sezonun bölüm bilgileri henüz eklenmemiş.</p>
            ) : (
                <ol className="space-y-3">
                    {sezon.bolumler.map((b) => {
                        const yayinlanmadi = b.tarih ? new Date(b.tarih) > new Date() : true;
                        return (
                            <li key={b.no} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-violet-400/30 hover:bg-white/[0.05]">
                                <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-xl bg-white/5 sm:w-48">
                                    {b.gorselPath ? (
                                        <Image src={bolumGorselUrl(b.gorselPath)} alt="" fill unoptimized sizes="192px" className="object-cover" />
                                    ) : (
                                        <ImageOff className="absolute inset-0 m-auto size-6 text-white/20" />
                                    )}
                                    <span className="absolute left-1.5 top-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-bold text-white">{b.no}</span>
                                </div>
                                <div className="min-w-0 flex-1 py-0.5">
                                    <p className="line-clamp-1 font-semibold">{b.ad}</p>
                                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-foreground/50">
                                        {b.tarih && <span className="flex items-center gap-1"><CalendarDays className="size-3" />{tarihMetni(b.tarih)}</span>}
                                        {b.sure && <span className="flex items-center gap-1"><Clock className="size-3" />{sureMetni(b.sure)}</span>}
                                        {b.puan > 0 && !yayinlanmadi && <span className="flex items-center gap-1"><Star className="size-3 fill-amber-400 text-amber-400" />{b.puan.toFixed(1)}</span>}
                                        {yayinlanmadi && <span className="rounded-full bg-violet-500/20 px-2 text-violet-200">Yakında</span>}
                                    </div>
                                    {b.ozet && <p className="mt-2 line-clamp-2 text-sm text-foreground/65">{b.ozet}</p>}
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}
        </section>
    );
}
