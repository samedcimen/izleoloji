"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark, Check, Heart, ListPlus, Play, Plus, Tv } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KayitDurumu } from "@/lib/kutuphane";
import type { IcerikTipi } from "@/lib/tmdb/gorsel";
import { durumDegistir, favoriDegistir, puanVer } from "@/app/actions/kayit";
import { listeOgesiDegistir } from "@/app/actions/liste";
import { FragmanPenceresi } from "@/components/ana-sayfa/fragman-penceresi";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { YildizPuan, puanMetni } from "./yildiz-puan";
import { YeniListePenceresi } from "./yeni-liste-penceresi";

export type ListeSecenegi = { id: string; ad: string; var: boolean };

// Detay sayfasının üstündeki izleme paneli. Değişiklikler hemen ekrana yansır (iyimser),
// sunucu hata verirse eski haline döner. Misafir basınca giriş sayfasına yönlenir.
export function KayitPaneli({ tip, tmdbId, baslik, fragmanKey, girisli, ilk, listeler: ilkListeler }: {
    tip: IcerikTipi;
    tmdbId: number;
    baslik: string;
    fragmanKey: string | null;
    girisli: boolean;
    ilk: KayitDurumu;
    listeler: ListeSecenegi[];
}) {
    const router = useRouter();
    const yol = usePathname();
    const [kayit, setKayit] = useState(ilk);
    const [listeler, setListeler] = useState(ilkListeler);
    const [fragman, setFragman] = useState(false);
    const [yeniListe, setYeniListe] = useState(false);
    const [hata, setHata] = useState<string | null>(null);
    const [bekliyor, baslat] = useTransition();

    const girisIste = () => router.push(`/giris?geri=${encodeURIComponent(yol)}`);

    const uygula = (tahmin: KayitDurumu, islem: () => Promise<{ hata?: string } & Partial<KayitDurumu>>) => {
        if (!girisli) return girisIste();
        const onceki = kayit;
        setKayit(tahmin);
        setHata(null);
        baslat(async () => {
            const r = await islem();
            if (r.hata) {
                setKayit(onceki);
                if (r.hata === "giris") return girisIste();
                setHata("Kaydedilemedi, tekrar dene.");
            } else {
                setKayit({ durum: r.durum ?? null, puan: r.puan ?? null, favori: !!r.favori });
            }
        });
    };

    const durum = (d: "izledi" | "izleyecek") =>
        uygula({ ...kayit, durum: kayit.durum === d ? null : d }, () => durumDegistir(tip, tmdbId, d));

    const listeyiDegistir = (l: ListeSecenegi) => {
        setListeler((ls) => ls.map((x) => (x.id === l.id ? { ...x, var: !x.var } : x)));
        baslat(async () => {
            const r = await listeOgesiDegistir(l.id, tip, tmdbId, !l.var);
            if (r.hata) {
                setListeler((ls) => ls.map((x) => (x.id === l.id ? { ...x, var: l.var } : x)));
                setHata(r.hata);
            }
        });
    };

    const ikincil = "flex h-12 items-center gap-2 rounded-full border px-5 font-semibold backdrop-blur transition active:scale-[0.98]";
    const pasif = "border-white/20 bg-white/10 text-white hover:bg-white/20";
    const aktif = "border-violet-300/60 bg-violet-600 text-white shadow-[0_8px_24px_-8px_rgb(124_58_237/0.8)] hover:bg-violet-500";
    const izliyor = kayit.durum === "izliyor";
    const listedeSayisi = listeler.filter((l) => l.var).length;

    return (
        <div>
            <div className="flex flex-wrap gap-3">
                {fragmanKey && (
                    <button
                        type="button"
                        onClick={() => setFragman(true)}
                        className="flex h-12 items-center gap-2 rounded-full bg-white px-6 font-bold text-black transition hover:bg-white/85 active:scale-[0.98]"
                    >
                        <Play className="size-5 fill-current" />
                        Fragmanı izle
                    </button>
                )}

                <button type="button" onClick={() => durum("izledi")} aria-pressed={kayit.durum === "izledi"} className={cn(ikincil, kayit.durum === "izledi" ? aktif : pasif)}>
                    <Check className="size-5" />
                    {kayit.durum === "izledi" ? "İzledin" : "İzledim"}
                </button>

                {izliyor ? (
                    <span className={cn(ikincil, aktif, "cursor-default")} title="Bölüm işaretledikçe ilerler">
                        <Tv className="size-5" />
                        İzliyorsun
                    </span>
                ) : (
                    <button type="button" onClick={() => durum("izleyecek")} aria-pressed={kayit.durum === "izleyecek"} className={cn(ikincil, kayit.durum === "izleyecek" ? aktif : pasif)}>
                        <Bookmark className={cn("size-5", kayit.durum === "izleyecek" && "fill-current")} />
                        {kayit.durum === "izleyecek" ? "Listende" : "İzleyeceğim"}
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => uygula({ ...kayit, favori: !kayit.favori }, () => favoriDegistir(tip, tmdbId))}
                    aria-pressed={kayit.favori}
                    aria-label={kayit.favori ? "Favorilerden çıkar" : "Favorilere ekle"}
                    title={kayit.favori ? "Favorilerinde" : "Favorilere ekle"}
                    className={cn(ikincil, "w-12 justify-center px-0", kayit.favori ? "border-rose-300/60 bg-rose-500 text-white hover:bg-rose-400" : pasif)}
                >
                    <Heart className={cn("size-5", kayit.favori && "fill-current")} />
                </button>

                {girisli ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger aria-label="Listeye ekle" title="Listeye ekle" className={cn(ikincil, "relative w-12 justify-center px-0", listedeSayisi ? aktif : pasif)}>
                            <Plus className="size-5" />
                            {listedeSayisi > 0 && (
                                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-white text-[10px] font-bold text-violet-700">{listedeSayisi}</span>
                            )}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" sideOffset={8} className="w-64">
                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Listelerine ekle</DropdownMenuLabel>
                                {listeler.length === 0 && <p className="px-2 py-2 text-sm text-muted-foreground">Henüz listen yok.</p>}
                                {listeler.map((l) => (
                                    <DropdownMenuCheckboxItem key={l.id} checked={l.var} onCheckedChange={() => listeyiDegistir(l)} closeOnClick={false}>
                                        <span className="truncate">{l.ad}</span>
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setYeniListe(true)}>
                                <ListPlus />
                                Yeni liste oluştur
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <button type="button" onClick={girisIste} aria-label="Listeye ekle" className={cn(ikincil, "w-12 justify-center px-0", pasif)}>
                        <Plus className="size-5" />
                    </button>
                )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
                <YildizPuan deger={kayit.puan} devreDisi={bekliyor && girisli} degistir={(p) => uygula({ ...kayit, puan: p, durum: p ? "izledi" : kayit.durum }, () => puanVer(tip, tmdbId, p))} />
                <span className="text-sm text-white/60">{puanMetni(kayit.puan) ? <>Puanın <b className="text-white">{puanMetni(kayit.puan)}</b></> : "Puan ver"}</span>
                {hata && <span role="alert" className="text-sm text-red-300">{hata}</span>}
            </div>

            {fragmanKey && <FragmanPenceresi baslik={baslik} youtubeKey={fragmanKey} acik={fragman} kapat={() => setFragman(false)} />}
            {girisli && (
                <YeniListePenceresi
                    acik={yeniListe}
                    kapat={() => setYeniListe(false)}
                    olusturuldu={(liste) => {
                        setListeler((ls) => [{ ...liste, var: true }, ...ls]);
                        baslat(async () => { await listeOgesiDegistir(liste.id, tip, tmdbId, true); });
                    }}
                    aciklama={`"${baslik}" yeni listeye eklenecek.`}
                />
            )}
        </div>
    );
}
