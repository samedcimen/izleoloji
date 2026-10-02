"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, Check, CheckCheck, Clock, ImageOff, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { sureMetni, tarihMetni } from "@/lib/bicim";
import { bolumGorselUrl } from "@/lib/tmdb/gorsel";
import type { SezonDetay, SezonOzet } from "@/lib/tmdb/detay";
import { sezonGetir } from "@/app/actions/icerik";
import { bolumDegistir, sezonDegistir } from "@/app/actions/kayit";

// Sezon seçici + bölüm listesi + bölüm bölüm izleme takibi. İlk sezonun bölümleri sunucudan
// hazır gelir. izlenenler: "sezon-bölüm" anahtarları.
export function Sezonlar({ diziId, sezonlar, ilkSezon, girisli, izlenenler: ilkIzlenenler }: {
    diziId: number;
    sezonlar: SezonOzet[];
    ilkSezon: SezonDetay | null;
    girisli: boolean;
    izlenenler: string[];
}) {
    const router = useRouter();
    const yol = usePathname();
    const [secili, setSecili] = useState(ilkSezon?.no ?? sezonlar[0]?.no ?? 1);
    const [sezon, setSezon] = useState(ilkSezon);
    const [izlenen, setIzlenen] = useState(() => new Set(ilkIzlenenler));
    const [yukleniyor, baslatYukle] = useTransition();
    const [, baslatKayit] = useTransition();

    if (sezonlar.length === 0) return null;

    const bugun = new Date().toISOString().slice(0, 10);
    const yayinda = (sezon?.bolumler ?? []).filter((b) => b.tarih && b.tarih <= bugun);
    const sezonIzlenen = yayinda.filter((b) => izlenen.has(`${secili}-${b.no}`)).length;
    const sezonTamam = yayinda.length > 0 && sezonIzlenen === yayinda.length;

    const sec = (no: number) => {
        if (no === secili) return;
        setSecili(no);
        baslatYukle(async () => setSezon(await sezonGetir(diziId, no)));
    };

    // İyimser güncelle, sunucunun döndürdüğü listeyle eşitle; hata olursa geri al
    const kaydet = (tahmin: Set<string>, islem: () => ReturnType<typeof bolumDegistir>) => {
        if (!girisli) return router.push(`/giris?geri=${encodeURIComponent(yol)}`);
        const onceki = izlenen;
        setIzlenen(tahmin);
        baslatKayit(async () => {
            const r = await islem();
            if (r.hata) setIzlenen(onceki);
            else setIzlenen(new Set(r.izlenenler));
        });
    };

    const bolumTikla = (no: number) => {
        const a = `${secili}-${no}`;
        const yeni = new Set(izlenen);
        if (yeni.has(a)) yeni.delete(a);
        else yeni.add(a);
        kaydet(yeni, () => bolumDegistir(diziId, secili, no));
    };

    const sezonTikla = () => {
        const yeni = new Set(izlenen);
        for (const b of yayinda) {
            if (sezonTamam) yeni.delete(`${secili}-${b.no}`);
            else yeni.add(`${secili}-${b.no}`);
        }
        kaydet(yeni, () => sezonDegistir(diziId, secili, !sezonTamam));
    };

    const sezondaIzlenen = (no: number) => [...izlenen].filter((a) => a.startsWith(`${no}-`)).length;

    return (
        <section className="px-4 sm:px-8">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-lg font-bold tracking-tight sm:text-xl">Sezonlar ve bölümler</h2>
                <span className="text-sm text-foreground/50">{sezonlar.length} sezon · {izlenen.size} bölüm izledin</span>
            </div>

            <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Sezon">
                {sezonlar.map((s) => {
                    const sayi = sezondaIzlenen(s.no);
                    const bitti = sayi > 0 && sayi >= s.bolumSayisi;
                    return (
                        <button
                            key={s.no}
                            type="button"
                            role="tab"
                            aria-selected={s.no === secili}
                            onClick={() => sec(s.no)}
                            className={cn(
                                "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold transition",
                                s.no === secili ? "border-violet-400/60 bg-violet-500/20 text-white" : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white",
                            )}
                        >
                            {bitti && <CheckCheck className="size-3.5 text-emerald-400" />}
                            {s.no === 0 ? "Özel" : `${s.no}. Sezon`}
                            <span className="text-xs font-normal opacity-60">{sayi > 0 ? `${sayi}/${s.bolumSayisi}` : s.bolumSayisi}</span>
                        </button>
                    );
                })}
            </div>

            {!yukleniyor && yayinda.length > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <div className="min-w-40 flex-1">
                        <div className="mb-1.5 flex justify-between text-xs text-foreground/55">
                            <span>Bu sezon</span>
                            <span>{sezonIzlenen} / {yayinda.length} bölüm</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-linear-to-r from-violet-500 to-emerald-400 transition-[width] duration-500" style={{ width: `${(sezonIzlenen / yayinda.length) * 100}%` }} />
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={sezonTikla}
                        className={cn(
                            "flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold transition",
                            sezonTamam ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25" : "border-white/15 bg-white/5 hover:bg-white/10",
                        )}
                    >
                        <CheckCheck className="size-4" />
                        {sezonTamam ? "Sezonu izledin" : "Sezonu izledim"}
                    </button>
                </div>
            )}

            {yukleniyor ? (
                <div className="space-y-3">{Array.from({ length: 4 }, (_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5" />)}</div>
            ) : !sezon || sezon.bolumler.length === 0 ? (
                <p className="rounded-2xl border border-white/10 p-6 text-center text-sm text-foreground/50">Bu sezonun bölüm bilgileri henüz eklenmemiş.</p>
            ) : (
                <ol className="space-y-3">
                    {sezon.bolumler.map((b) => {
                        const yayinlanmadi = !b.tarih || b.tarih > bugun;
                        const izlendi = izlenen.has(`${secili}-${b.no}`);
                        return (
                            <li
                                key={b.no}
                                className={cn(
                                    "flex gap-4 rounded-2xl border p-3 transition",
                                    izlendi ? "border-emerald-400/20 bg-emerald-500/[0.04]" : "border-white/10 bg-white/[0.03] hover:border-violet-400/30 hover:bg-white/[0.05]",
                                )}
                            >
                                <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-xl bg-white/5 sm:w-48">
                                    {b.gorselPath ? (
                                        <Image src={bolumGorselUrl(b.gorselPath)} alt="" fill unoptimized sizes="192px" className={cn("object-cover", izlendi && "opacity-60")} />
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
                                {!yayinlanmadi && (
                                    <button
                                        type="button"
                                        onClick={() => bolumTikla(b.no)}
                                        aria-pressed={izlendi}
                                        aria-label={izlendi ? `${b.no}. bölümü izlenmedi yap` : `${b.no}. bölümü izledim`}
                                        title={izlendi ? "İzlendi" : "İzledim olarak işaretle"}
                                        className={cn(
                                            "grid size-10 shrink-0 place-items-center self-center rounded-full border transition active:scale-95",
                                            izlendi ? "border-emerald-400 bg-emerald-500 text-white hover:bg-emerald-400" : "border-white/20 text-white/40 hover:border-emerald-400/60 hover:text-emerald-300",
                                        )}
                                    >
                                        <Check className="size-5" />
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ol>
            )}
        </section>
    );
}
