"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MENU } from "@/lib/ayarlar/menu";
import { Avatar, KullaniciMenusu, type MenuKullanici } from "./kullanici-menusu";

// Masaüstü yan menü: 72px ikon çubuğu; fare üstüne gelince (ya da klavyeyle odaklanınca)
// isimlerle 240px'e genişler. Genişleme sayfayı itmez, içeriğin üstüne açılır.
export function YanMenu({ kullanici }: { kullanici: MenuKullanici }) {
    const yol = usePathname();

    return (
        <aside
            className="group/yan fixed inset-y-0 left-0 z-50 hidden w-[72px] flex-col overflow-hidden border-r border-white/10 bg-background/85 backdrop-blur-xl transition-[width,box-shadow] duration-300 ease-out hover:w-60 hover:shadow-[20px_0_60px_-20px_rgb(0_0_0/0.8)] focus-within:w-60 lg:flex"
            aria-label="Ana menü"
        >
            <Link href="/" className="flex h-16 shrink-0 items-center gap-3 px-[22px] text-2xl font-black tracking-tight">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-linear-to-br from-violet-500 to-fuchsia-500 text-sm text-white">i</span>
                <span className="whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover/yan:opacity-100 group-focus-within/yan:opacity-100">
                    <span className="text-white">izle</span>
                    <span className="bg-linear-to-br from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">oloji</span>
                </span>
            </Link>

            <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
                {MENU.map((o) => {
                    const aktif = !o.yakinda && (o.href === "/" ? yol === "/" : yol.startsWith(o.href));
                    const icerik = (
                        <>
                            <o.ikon className="size-5 shrink-0" />
                            <span className="flex-1 whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover/yan:opacity-100 group-focus-within/yan:opacity-100">
                                {o.ad}
                            </span>
                            {o.yakinda && (
                                <span className="whitespace-nowrap rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-white/50 opacity-0 transition-opacity group-hover/yan:opacity-100 group-focus-within/yan:opacity-100">
                                    Yakında
                                </span>
                            )}
                        </>
                    );
                    const sinif = cn(
                        "flex h-11 items-center gap-4 rounded-xl px-3.5 text-sm font-medium transition",
                        aktif && "bg-violet-500/15 text-white shadow-[inset_3px_0_0_rgb(167_139_250)]",
                        !aktif && !o.yakinda && "text-white/65 hover:bg-white/5 hover:text-white",
                        o.yakinda && "cursor-default text-white/30",
                    );
                    return o.yakinda ? (
                        <span key={o.href} className={sinif} aria-disabled title={`${o.ad} — yakında`}>
                            {icerik}
                        </span>
                    ) : (
                        <Link key={o.href} href={o.href} className={sinif} aria-current={aktif ? "page" : undefined} title={o.ad}>
                            {icerik}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-white/10 p-3">
                <KullaniciMenusu
                    kullanici={kullanici}
                    yon="right"
                    tetikleyici={
                        <>
                            <Avatar kullanici={kullanici} className="ml-1" />
                            <span className="min-w-0 flex-1 opacity-0 transition-opacity duration-200 group-hover/yan:opacity-100 group-focus-within/yan:opacity-100">
                                <span className="block truncate text-sm font-semibold">{kullanici.ad ?? "İzleyici"}</span>
                                {kullanici.kullaniciAdi && <span className="block truncate text-xs text-white/50">@{kullanici.kullaniciAdi}</span>}
                            </span>
                        </>
                    }
                />
            </div>
        </aside>
    );
}
