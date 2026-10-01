"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Film, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { MENU } from "@/lib/ayarlar/menu";
import type { SeviyeBilgisi } from "@/lib/seviye";
import { Avatar, KullaniciMenusu, type MenuKullanici } from "./kullanici-menusu";

// Masaüstünde sabit yan menü (272px, içerik boşluğu: YAN_MENU_GENISLIK): mor ışımalı tek panel.
// Üstte gezinme, ortada kütüphane kısayolları, altta seviye çubuklu profil kartı (tıklayınca hesap menüsü).

// Listeler özelliği gelince gerçek listelerle değişecek
const KUTUPHANE = [
    { ad: "Sonra izleyeceklerim", ikon: Bookmark, renk: "from-violet-600 to-indigo-600" },
    { ad: "Favorilerim", ikon: Heart, renk: "from-rose-500 to-orange-500" },
    { ad: "İzlediklerim", ikon: Film, renk: "from-emerald-500 to-teal-600" },
];

const Yakinda = () => (
    <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-white/45">Yakında</span>
);

export function YanMenu({ kullanici, seviye }: { kullanici: MenuKullanici; seviye: SeviyeBilgisi }) {
    const yol = usePathname();

    return (
        <aside
            className="fixed inset-y-0 left-0 z-50 hidden w-[17rem] flex-col overflow-hidden border-r border-violet-500/15 bg-[#0a0812] lg:flex"
            aria-label="Ana menü"
        >
            <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-violet-600/30 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-24 size-72 rounded-full bg-fuchsia-600/15 blur-3xl" />

            <Link href="/" className="relative flex h-20 shrink-0 items-center gap-2.5 px-6 text-2xl font-black tracking-tight">
                <span className="grid size-8 place-items-center rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500 text-sm text-white">i</span>
                <span>
                    <span className="text-white">izle</span>
                    <span className="bg-linear-to-br from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">oloji</span>
                </span>
            </Link>

            <nav className="relative space-y-1 px-4">
                {MENU.map((o) => {
                    const aktif = !o.yakinda && (o.href === "/" ? yol === "/" : yol.startsWith(o.href));
                    const sinif = cn(
                        "flex h-11 items-center gap-3.5 rounded-xl px-3 text-sm font-semibold transition",
                        aktif && "bg-linear-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_8px_24px_-8px_rgb(168_85_247/0.8)]",
                        !aktif && !o.yakinda && "text-white/65 hover:bg-white/5 hover:text-white",
                        o.yakinda && "cursor-default text-white/35",
                    );
                    const icerik = (
                        <>
                            <o.ikon className="size-[18px] shrink-0" />
                            <span className="flex-1">{o.ad}</span>
                            {o.yakinda && <Yakinda />}
                        </>
                    );
                    return o.yakinda ? (
                        <span key={o.href} className={sinif} aria-disabled>{icerik}</span>
                    ) : (
                        <Link key={o.href} href={o.href} className={sinif} aria-current={aktif ? "page" : undefined}>{icerik}</Link>
                    );
                })}
            </nav>

            <div className="relative mt-6 flex-1 overflow-y-auto px-4">
                <p className="mb-1.5 flex items-center justify-between px-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">
                    Kütüphanem <Yakinda />
                </p>
                {KUTUPHANE.map((l) => (
                    <span key={l.ad} className="flex items-center gap-3 rounded-lg p-1.5 opacity-50" aria-disabled>
                        <span className={cn("grid size-9 shrink-0 place-items-center rounded-md bg-linear-to-br", l.renk)}>
                            <l.ikon className="size-4" />
                        </span>
                        <span className="truncate text-sm font-semibold">{l.ad}</span>
                    </span>
                ))}
            </div>

            <div className="relative m-4 rounded-2xl bg-linear-to-br from-violet-600/25 to-fuchsia-600/10 p-1.5 ring-1 ring-violet-400/20">
                <KullaniciMenusu
                    kullanici={kullanici}
                    yon="top"
                    tetikleyiciSinif="rounded-xl p-0 hover:ring-transparent"
                    tetikleyici={
                        <span className="block w-full rounded-xl p-2 transition hover:bg-white/5">
                            <span className="mb-3 flex items-center gap-3">
                                <Avatar kullanici={kullanici} />
                                <span className="min-w-0">
                                    <span className="block truncate text-sm font-semibold">{kullanici.ad ?? "İzleyici"}</span>
                                    {kullanici.kullaniciAdi && <span className="block truncate text-xs text-white/50">@{kullanici.kullaniciAdi}</span>}
                                </span>
                            </span>
                            <SeviyeCubugu seviye={seviye} />
                        </span>
                    }
                />
            </div>
        </aside>
    );
}

function SeviyeCubugu({ seviye }: { seviye: SeviyeBilgisi }) {
    return (
        <span className="block" title={seviye.sonrakiEsik ? `Sonraki seviyeye ${seviye.sonrakiEsik - seviye.xp} XP` : "En yüksek seviye"}>
            <span className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-violet-200">{seviye.ad} · Sv. {seviye.no}</span>
                <span className="text-white/40">{seviye.sonrakiEsik ? `${seviye.xp} / ${seviye.sonrakiEsik} XP` : `${seviye.xp} XP`}</span>
            </span>
            <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500" style={{ width: `${Math.max(3, seviye.ilerleme)}%` }} />
            </span>
        </span>
    );
}
