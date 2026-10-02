"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SeviyeBilgisi } from "@/lib/seviye";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { KullaniciMenusu, type MenuKullanici } from "./kullanici-menusu";
import { YAN_MENU_ZEMIN, YanMenuIcerik } from "./yan-menu";
import { AramaDugmesi } from "@/components/arama/arama-penceresi";

export type { MenuKullanici };

// Mobil/tablet üst çubuğu (masaüstünde sabit yan menü var). ☰ yan menüyü soldan çekmece olarak açar.
// Sayfanın üstündeyken koyu vitrinin üstünde şeffaf (beyaz yazı), kaydırınca temaya uygun buzlu cam.
export function UstMenu({ kullanici, seviye }: { kullanici: MenuKullanici; seviye: SeviyeBilgisi }) {
    const [kaydi, setKaydi] = useState(false);
    const [acik, setAcik] = useState(false);

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
                kaydi ? "border-b border-foreground/10 bg-background/80 text-foreground backdrop-blur-xl" : "bg-linear-to-b from-black/60 to-transparent text-white",
            )}
        >
            <div className="flex h-16 items-center gap-2 px-2 sm:px-6">
                <Sheet open={acik} onOpenChange={setAcik}>
                    <SheetTrigger
                        className="grid size-10 place-items-center rounded-full transition hover:bg-current/10 focus-visible:outline-2 focus-visible:outline-violet-400"
                        aria-label="Menüyü aç"
                    >
                        <Menu className="size-6" />
                    </SheetTrigger>
                    <SheetContent side="left" className={cn("w-[17rem] gap-0 overflow-hidden border-violet-500/15 p-0 text-foreground sm:max-w-[17rem]", YAN_MENU_ZEMIN)}>
                        <SheetTitle className="sr-only">Ana menü</SheetTitle>
                        <YanMenuIcerik kullanici={kullanici} seviye={seviye} kapat={() => setAcik(false)} />
                    </SheetContent>
                </Sheet>

                <Link href="/" className="text-2xl font-black tracking-tight">
                    <span>izle</span>
                    <span className="bg-linear-to-br from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">oloji</span>
                </Link>
                <div className="ml-auto flex items-center gap-1 pr-2">
                    <AramaDugmesi kisa />
                    <KullaniciMenusu kullanici={kullanici} />
                </div>
            </div>
        </header>
    );
}
