import { Compass, Home, List, Rss, Sparkles, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Site menüsü — yan menü (masaüstü) ve ileride mobil alt çubuk buradan okur.
// yakinda: menüde soluk ve tıklanamaz gösterir (şu an kullanılmıyor; yapılmamış sayfalar 404'e düşer).
export type MenuOgesi = { ad: string; href: string; ikon: LucideIcon; yakinda?: boolean };

// Sabit yan menünün genişliği kadar içerik boşluğu (components/site/yan-menu.tsx: w-[17rem]).
// Sunucu bileşenleri de kullandığı için "use client" dosyasında değil burada.
export const YAN_MENU_GENISLIK = "lg:pl-[17rem]";

export const MENU: MenuOgesi[] = [
    { ad: "Ana sayfa", href: "/", ikon: Home },
    { ad: "Keşfet", href: "/kesfet", ikon: Compass },
    { ad: "Ne izlesem?", href: "/ne-izlesem", ikon: Sparkles },
    { ad: "Listelerim", href: "/listelerim", ikon: List },
    { ad: "Akış", href: "/akis", ikon: Rss },
    { ad: "Profil", href: "/profil", ikon: User },
];
