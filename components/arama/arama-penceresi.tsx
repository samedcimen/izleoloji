"use client";

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock, CornerDownLeft, LoaderCircle, Search, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { posterUrl, profilUrl, icerikYolu } from "@/lib/tmdb/gorsel";
import type { HizliSonuclar } from "@/lib/arama";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Avatar } from "@/components/site/kullanici-menusu";

// Sitenin her yerinden açılan arama penceresi: Ctrl/⌘+K veya "/" kısayolu, menülerdeki ara düğmeleri.
// Yazdıkça /api/ara'ya (250 ms gecikmeli) sorar; oklarla gezilir, Enter seçer.

const AramaBaglami = createContext<() => void>(() => {});
export const useAramaAc = () => useContext(AramaBaglami);

const SON_ARAMALAR = "izleoloji.son-aramalar";
const BOS: HizliSonuclar = { icerikler: [], kisiler: [], kullanicilar: [] };

function sonAramalariOku(): string[] {
    try {
        const v = JSON.parse(localStorage.getItem(SON_ARAMALAR) ?? "[]");
        return Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, 6) : [];
    } catch {
        return [];
    }
}
function sonAramalariYaz(l: string[]) {
    try { localStorage.setItem(SON_ARAMALAR, JSON.stringify(l.slice(0, 6))); } catch {}
}

export function AramaSaglayici({ children }: { children: React.ReactNode }) {
    const [acik, setAcik] = useState(false);
    const ac = useCallback(() => setAcik(true), []);

    useEffect(() => {
        const tus = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setAcik((a) => !a);
                return;
            }
            // "/" yalnız bir yazı alanında değilken
            const hedef = e.target as HTMLElement;
            if (e.key === "/" && !hedef.isContentEditable && !["INPUT", "TEXTAREA", "SELECT"].includes(hedef.tagName)) {
                e.preventDefault();
                setAcik(true);
            }
        };
        addEventListener("keydown", tus);
        return () => removeEventListener("keydown", tus);
    }, []);

    return (
        <AramaBaglami.Provider value={ac}>
            {children}
            <Dialog open={acik} onOpenChange={setAcik}>
                <DialogContent
                    showCloseButton={false}
                    className="top-3 flex max-h-[calc(100dvh-1.5rem)] max-w-[calc(100%-1.5rem)] translate-y-0 flex-col gap-0 overflow-hidden border border-white/10 bg-[#100c1a] p-0 sm:top-[10vh] sm:max-h-[75vh] sm:max-w-2xl"
                    overlayClassName="bg-black/60"
                >
                    <DialogTitle className="sr-only">Ara</DialogTitle>
                    {acik && <AramaIcerik kapat={() => setAcik(false)} />}
                </DialogContent>
            </Dialog>
        </AramaBaglami.Provider>
    );
}

type Oge = { href: string; anahtar: string; kayit?: string };

function AramaIcerik({ kapat }: { kapat: () => void }) {
    const router = useRouter();
    const listeId = useId();
    const [q, setQ] = useState("");
    const [sonuc, setSonuc] = useState<HizliSonuclar>(BOS);
    const [arananQ, setArananQ] = useState("");
    const [yukleniyor, setYukleniyor] = useState(false);
    const [hata, setHata] = useState(false);
    const [secili, setSecili] = useState(0);
    const [sonAramalar, setSonAramalar] = useState(sonAramalariOku);
    const liste = useRef<HTMLDivElement>(null);
    const temiz = q.trim();

    useEffect(() => {
        if (temiz.length < 2) return;
        const iptal = new AbortController();
        const zaman = setTimeout(async () => {
            setYukleniyor(true);
            try {
                const r = await fetch(`/api/ara?q=${encodeURIComponent(temiz)}`, { signal: iptal.signal });
                if (!r.ok) throw new Error();
                setSonuc(await r.json());
                setArananQ(temiz);
                setHata(false);
                setSecili(0);
            } catch (e) {
                if ((e as Error).name !== "AbortError") setHata(true);
            } finally {
                if (!iptal.signal.aborted) setYukleniyor(false);
            }
        }, 250);
        return () => { clearTimeout(zaman); iptal.abort(); };
    }, [temiz]);

    const gorunen = temiz.length >= 2 && arananQ ? sonuc : BOS;
    const tumSonuclar = `/ara?q=${encodeURIComponent(temiz)}`;

    // Klavyeyle gezilen düz liste (bölüm sırasıyla aynı)
    const ogeler = useMemo<Oge[]>(() => {
        if (temiz.length < 2) return sonAramalar.map((s) => ({ href: `/ara?q=${encodeURIComponent(s)}`, anahtar: `son-${s}`, kayit: s }));
        return [
            ...gorunen.icerikler.map((k) => ({ href: icerikYolu(k), anahtar: `${k.tip}-${k.id}` })),
            ...gorunen.kisiler.map((k) => ({ href: `/oyuncu/${k.id}`, anahtar: `kisi-${k.id}` })),
            ...gorunen.kullanicilar.map((u) => ({ href: `/kullanici/${u.kullaniciAdi}`, anahtar: `kullanici-${u.id}` })),
            { href: tumSonuclar, anahtar: "tumu" },
        ];
    }, [temiz, sonAramalar, gorunen, tumSonuclar]);

    const git = (o: Oge) => {
        const kayit = o.kayit ?? temiz;
        if (kayit.length >= 2) {
            const yeni = [kayit, ...sonAramalariOku().filter((s) => s.toLocaleLowerCase("tr-TR") !== kayit.toLocaleLowerCase("tr-TR"))];
            sonAramalariYaz(yeni);
        }
        kapat();
        router.push(o.href);
    };

    const tus = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (!ogeler.length) return;
            const yeni = (secili + (e.key === "ArrowDown" ? 1 : -1) + ogeler.length) % ogeler.length;
            setSecili(yeni);
            liste.current?.querySelector(`[data-sira="${yeni}"]`)?.scrollIntoView({ block: "nearest" });
        } else if (e.key === "Enter") {
            e.preventDefault();
            const o = ogeler[secili];
            if (o) git(o);
            else if (temiz.length >= 2) git({ href: tumSonuclar, anahtar: "tumu" });
        }
    };

    const sira = (anahtar: string) => ogeler.findIndex((o) => o.anahtar === anahtar);
    const ogeProps = (anahtar: string) => {
        const i = sira(anahtar);
        return {
            id: `${listeId}-${i}`,
            role: "option" as const,
            "aria-selected": i === secili,
            "data-sira": i,
            onMouseMove: () => i !== secili && setSecili(i),
            onClick: () => git(ogeler[i]),
            className: cn("flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left transition", i === secili ? "bg-violet-500/15" : "hover:bg-white/5"),
        };
    };

    const sonucYok = temiz.length >= 2 && arananQ === temiz && !yukleniyor && !hata && ogeler.length === 1;

    return (
        <>
            <div className="flex items-center gap-3 border-b border-white/10 px-4">
                {yukleniyor ? <LoaderCircle className="size-5 shrink-0 animate-spin text-violet-300" /> : <Search className="size-5 shrink-0 text-white/50" />}
                <input
                    autoFocus
                    value={q}
                    onChange={(e) => { setQ(e.target.value); setSecili(0); }}
                    onKeyDown={tus}
                    maxLength={100}
                    placeholder="Film, dizi, oyuncu ya da kullanıcı ara"
                    aria-label="Ara"
                    role="combobox"
                    aria-expanded
                    aria-controls={listeId}
                    aria-activedescendant={ogeler.length ? `${listeId}-${secili}` : undefined}
                    autoComplete="off"
                    spellCheck={false}
                    className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-white/35"
                />
                {q && (
                    <button type="button" onClick={() => setQ("")} aria-label="Temizle" className="grid size-7 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white">
                        <X className="size-4" />
                    </button>
                )}
                <button type="button" onClick={kapat} className="rounded-md border border-white/15 px-1.5 py-0.5 text-[11px] font-semibold text-white/50 hover:text-white">
                    Esc
                </button>
            </div>

            <div ref={liste} id={listeId} role="listbox" aria-label="Arama sonuçları" className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
                {temiz.length < 2 ? (
                    sonAramalar.length > 0 ? (
                        <Bolum baslik="Son aramaların" sag={<button type="button" onClick={() => { sonAramalariYaz([]); setSonAramalar([]); }} className="text-xs font-semibold text-white/40 hover:text-white">Temizle</button>}>
                            {sonAramalar.map((s) => (
                                <div key={s} {...ogeProps(`son-${s}`)}>
                                    <Clock className="size-4 shrink-0 text-white/40" />
                                    <span className="flex-1 truncate text-sm">{s}</span>
                                </div>
                            ))}
                        </Bolum>
                    ) : (
                        <p className="px-4 py-10 text-center text-sm text-white/45">Aramak için en az 2 harf yaz.</p>
                    )
                ) : hata ? (
                    <p className="px-4 py-10 text-center text-sm text-red-300">Arama şu an yapılamıyor, biraz sonra tekrar dene.</p>
                ) : sonucYok ? (
                    <p className="px-4 py-10 text-center text-sm text-white/45">&ldquo;{temiz}&rdquo; için sonuç bulunamadı.</p>
                ) : (
                    <>
                        {gorunen.icerikler.length > 0 && (
                            <Bolum baslik="Filmler ve diziler">
                                {gorunen.icerikler.map((k) => (
                                    <div key={`${k.tip}-${k.id}`} {...ogeProps(`${k.tip}-${k.id}`)}>
                                        <span className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-white/5">
                                            {k.posterPath && <Image src={posterUrl(k.posterPath, "w185")} alt="" fill unoptimized sizes="40px" className="object-cover" />}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-semibold">{k.baslik}</span>
                                            <span className="flex items-center gap-1.5 text-xs text-white/50">
                                                {k.tip === "film" ? "Film" : "Dizi"}
                                                {k.yil && <> · {k.yil}</>}
                                                {k.puan > 0 && <> · <Star className="size-3 fill-amber-400 text-amber-400" />{k.puan.toFixed(1)}</>}
                                            </span>
                                        </span>
                                    </div>
                                ))}
                            </Bolum>
                        )}
                        {gorunen.kisiler.length > 0 && (
                            <Bolum baslik="Kişiler">
                                {gorunen.kisiler.map((k) => (
                                    <div key={k.id} {...ogeProps(`kisi-${k.id}`)}>
                                        <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-white/5">
                                            {k.profilPath && <Image src={profilUrl(k.profilPath)} alt="" fill unoptimized sizes="40px" className="object-cover" />}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-semibold">{k.ad}</span>
                                            <span className="block truncate text-xs text-white/50">{[k.alan, ...k.bilinen].join(" · ")}</span>
                                        </span>
                                    </div>
                                ))}
                            </Bolum>
                        )}
                        {gorunen.kullanicilar.length > 0 && (
                            <Bolum baslik="Kullanıcılar">
                                {gorunen.kullanicilar.map((u) => (
                                    <div key={u.id} {...ogeProps(`kullanici-${u.id}`)}>
                                        <Avatar kullanici={{ ad: u.ad, kullaniciAdi: u.kullaniciAdi, resim: u.resim }} className="size-10" />
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-semibold">{u.ad ?? u.kullaniciAdi}</span>
                                            <span className="block truncate text-xs text-white/50">@{u.kullaniciAdi}</span>
                                        </span>
                                    </div>
                                ))}
                            </Bolum>
                        )}
                        {arananQ && (
                            <div {...ogeProps("tumu")}>
                                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-violet-500/20 text-violet-200">
                                    <ArrowRight className="size-4" />
                                </span>
                                <span className="flex-1 truncate text-sm font-semibold text-violet-200">&ldquo;{temiz}&rdquo; için tüm sonuçlar</span>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="hidden items-center gap-4 border-t border-white/10 px-4 py-2.5 text-[11px] text-white/40 sm:flex">
                <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> gez</span>
                <span className="flex items-center gap-1"><Kbd><CornerDownLeft className="size-3" /></Kbd> aç</span>
                <span className="flex items-center gap-1"><Kbd>Ctrl</Kbd><Kbd>K</Kbd> aç / kapat</span>
            </div>
        </>
    );
}

function Bolum({ baslik, sag, children }: { baslik: string; sag?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div role="group" aria-label={baslik} className="mb-2">
            <div className="flex items-center justify-between px-3 pb-1 pt-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">{baslik}</p>
                {sag}
            </div>
            {children}
        </div>
    );
}

const Kbd = ({ children }: { children: React.ReactNode }) => (
    <kbd className="grid h-5 min-w-5 place-items-center rounded border border-white/15 bg-white/5 px-1 font-sans text-[10px] font-semibold text-white/60">{children}</kbd>
);

// Menülerdeki arama tetikleyicileri
export function AramaDugmesi({ className, kisa }: { className?: string; kisa?: boolean }) {
    const ac = useAramaAc();
    if (kisa) {
        return (
            <button type="button" onClick={ac} aria-label="Ara" className={cn("grid size-10 place-items-center rounded-full transition hover:bg-current/10", className)}>
                <Search className="size-5" />
            </button>
        );
    }
    return (
        <button
            type="button"
            onClick={ac}
            className={cn("flex h-10 w-full items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/50 transition hover:border-violet-400/40 hover:bg-white/10 hover:text-white/80", className)}
        >
            <Search className="size-4" />
            <span className="flex-1 text-left">Ara</span>
            <span className="flex gap-0.5"><Kbd>Ctrl</Kbd><Kbd>K</Kbd></span>
        </button>
    );
}
