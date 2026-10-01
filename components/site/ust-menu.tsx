"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { KullaniciMenusu, type MenuKullanici } from "./kullanici-menusu";

export type { MenuKullanici };

// Mobil/tablet üst çubuğu (masaüstünde yan menü var). Sayfanın üstündeyken şeffaf,
// aşağı kaydırınca buzlu cam zemin.
export function UstMenu({ kullanici }: { kullanici: MenuKullanici }) {
    const [kaydi, setKaydi] = useState(false);

    useEffect(() => {
        const izle = () => setKaydi(scrollY > 24);
        izle();
        addEventListener("scroll", izle, { passive: true });
        return () => removeEventListener("scroll", izle);
    }, []);

    return (
        <header
            className={cn(
                "fixed inset-x-0 top-0 z-40 transition-colors duration-300 lg:hidden",
                kaydi ? "border-b border-white/10 bg-background/80 backdrop-blur-xl" : "bg-linear-to-b from-black/60 to-transparent",
            )}
        >
            <div className="flex h-16 items-center px-4 sm:px-8">
                <Link href="/" className="text-2xl font-black tracking-tight">
                    <span className="text-white">izle</span>
                    <span className="bg-linear-to-br from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">oloji</span>
                </Link>
                <div className="ml-auto">
                    <KullaniciMenusu kullanici={kullanici} />
                </div>
            </div>
        </header>
    );
}
