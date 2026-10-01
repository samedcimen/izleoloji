"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Film, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { MENU } from "@/lib/ayarlar/menu";
import type { SeviyeBilgisi } from "@/lib/seviye";
import { Avatar, KullaniciMenusu, type MenuKullanici } from "./kullanici-menusu";

// Yan menü paneli: masaüstünde sabit (272px, içerik boşluğu YAN_MENU_GENISLIK), mobilde
// üst çubuktaki ☰ ile soldan açılan çekmecede aynı içerik. Mor ışımalı tek panel.
export const YAN_MENU_ZEMIN = "bg-[#0a0812]";

// Listeler özelliği gelince kullanıcının gerçek listeleriyle değişecek
const KUTUPHANE = [
    { ad: "Sonra izleyeceklerim", href: "/listelerim/sonra-izle", ikon: Bookmark, renk: "from-violet-600 to-indigo-600" },
    { ad: "Favorilerim", href: "/listelerim/favoriler", ikon: Heart, renk: "from-rose-500 to-orange-500" },
    { ad: "İzlediklerim", href: "/listelerim/izlediklerim", ikon: Film, renk: "from-emerald-500 to-teal-600" },
];

const Yakinda = () => (
    <span className="rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px] font-semibold text-foreground/50">Yakında</span>
);

type Props = { kullanici: MenuKullanici; seviye: SeviyeBilgisi };

export function YanMenu(props: Props) {
    return (
        <aside
            className={cn("fixed inset-y-0 left-0 z-50 hidden w-[17rem] flex-col overflow-hidden border-r border-violet-500/15 lg:flex", YAN_MENU_ZEMIN)}
            aria-label="Ana menü"
        >
            <YanMenuIcerik {...props} />
        </aside>
    );
}

// kapat: mobil çekmecede bir bağlantıya basınca çekmeceyi kapatmak için
export function YanMenuIcerik({ kullanici, seviye, kapat }: Props & { kapat?: () => void }) {
    const yol = usePathname();

    return (
        <>
            <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-violet-600/30 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-24 size-72 rounded-full bg-fuchsia-600/15 blur-3xl" />

            <Link href="/" onClick={kapat} className="relative flex h-20 shrink-0 items-center gap-2.5 px-6 text-2xl font-black tracking-tight">
                <span className="grid size-8 place-items-center rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500 text-sm text-white">i</span>
                <span>
                    <span className="text-foreground">izle</span>
                    <span className="bg-linear-to-br from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">oloji</span>
                </span>
            </Link>

            <nav className="relative space-y-1 px-4">
                {MENU.map((o) => {
                    const aktif = !o.yakinda && (o.href === "/" ? yol === "/" : yol.startsWith(o.href));
                    const sinif = cn(
                        "flex h-11 items-center gap-3.5 rounded-xl px-3 text-sm font-semibold transition",
                        aktif && "bg-linear-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_8px_24px_-8px_rgb(168_85_247/0.8)]",
                        !aktif && !o.yakinda && "text-foreground/70 hover:bg-foreground/5 hover:text-foreground",
                        o.yakinda && "cursor-default text-foreground/35",
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
                        <Link key={o.href} href={o.href} onClick={kapat} className={sinif} aria-current={aktif ? "page" : undefined}>{icerik}</Link>
                    );
                })}
            </nav>

            <div className="relative mt-6 flex-1 overflow-y-auto px-4">
                <p className="mb-1.5 flex items-center justify-between px-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground/40">
                    Kütüphanem
                </p>
                {KUTUPHANE.map((l) => (
                    <Link
                        key={l.ad}
                        href={l.href}
                        onClick={kapat}
                        className={cn(
                            "group flex items-center gap-3 rounded-lg p-1.5 transition hover:bg-foreground/5",
                            yol === l.href && "bg-foreground/10",
                        )}
                    >
                        <span className={cn("grid size-9 shrink-0 place-items-center rounded-md bg-linear-to-br text-white transition group-hover:scale-105", l.renk)}>
                            <l.ikon className="size-4" />
                        </span>
                        <span className="truncate text-sm font-semibold text-foreground/75 transition group-hover:text-foreground">{l.ad}</span>
                    </Link>
                ))}
            </div>

            <div className="relative mx-4 mb-4 rounded-2xl bg-linear-to-br from-violet-600/25 to-fuchsia-600/10 p-1.5 ring-1 ring-violet-400/20">
                <KullaniciMenusu
                    kullanici={kullanici}
                    yon="top"
                    tetikleyiciSinif="rounded-xl p-0 hover:ring-transparent"
                    tetikleyici={
                        <span className="block w-full rounded-xl p-2 transition hover:bg-foreground/5">
                            <span className="mb-3 flex items-center gap-3">
                                <Avatar kullanici={kullanici} />
                                <span className="min-w-0">
                                    <span className="block truncate text-sm font-semibold">{kullanici.ad ?? "İzleyici"}</span>
                                    {kullanici.kullaniciAdi && <span className="block truncate text-xs text-foreground/50">@{kullanici.kullaniciAdi}</span>}
                                </span>
                            </span>
                            <SeviyeCubugu seviye={seviye} />
                        </span>
                    }
                />
            </div>
        </>
    );
}

function SeviyeCubugu({ seviye }: { seviye: SeviyeBilgisi }) {
    return (
        <span className="block" title={seviye.sonrakiEsik ? `Sonraki seviyeye ${seviye.sonrakiEsik - seviye.xp} XP` : "En yüksek seviye"}>
            <span className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-violet-200">{seviye.ad} · Sv. {seviye.no}</span>
                <span className="text-foreground/45">{seviye.sonrakiEsik ? `${seviye.xp} / ${seviye.sonrakiEsik} XP` : `${seviye.xp} XP`}</span>
            </span>
            <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-foreground/10">
                <span className="block h-full rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500" style={{ width: `${Math.max(3, seviye.ilerleme)}%` }} />
            </span>
        </span>
    );
}
