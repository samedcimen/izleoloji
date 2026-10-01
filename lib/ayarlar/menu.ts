import { Compass, Home, List, Rss, Sparkles, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Site menüsü — yan menü (masaüstü) ve ileride mobil alt çubuk buradan okur.
// yakinda: sayfası henüz yapılmadı; menüde soluk ve tıklanamaz görünür.
export type MenuOgesi = { ad: string; href: string; ikon: LucideIcon; yakinda?: boolean };

// Sabit yan menünün genişliği kadar içerik boşluğu (components/site/yan-menu.tsx: w-[17rem]).
// Sunucu bileşenleri de kullandığı için "use client" dosyasında değil burada.
export const YAN_MENU_GENISLIK = "lg:pl-[17rem]";

export const MENU: MenuOgesi[] = [
    { ad: "Ana sayfa", href: "/", ikon: Home },
    { ad: "Keşfet", href: "/kesfet", ikon: Compass, yakinda: true },
    { ad: "Ne izlesem?", href: "/ne-izlesem", ikon: Sparkles, yakinda: true },
    { ad: "Listelerim", href: "/listelerim", ikon: List, yakinda: true },
    { ad: "Akış", href: "/akis", ikon: Rss, yakinda: true },
    { ad: "Profil", href: "/profil", ikon: User, yakinda: true },
];
