import type { Metadata } from "next";
import { Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { proje } from "@/lib/ayarlar/proje";
import { env } from "@/lib/env";

// Türkçe karakterler (ş, ğ, ı, İ) latin-ext alt kümesinde
const outfit = Outfit({ subsets: ["latin", "latin-ext"], variable: "--font-sans" });

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin", "latin-ext"],
});

const ogBaslik = `${proje.baslik} — ${proje.baslik2}`;

export const metadata: Metadata = {
    title: {
        template: `%s ${proje.ayrac} ${proje.baslik}`,
        default: proje.baslik,
    },
    description: proje.aciklama,
    metadataBase: new URL(env.APP_URL),
    icons: { icon: proje.ikon, apple: proje.ikon },
    openGraph: {
        title: ogBaslik,
        description: proje.aciklama,
        siteName: proje.baslik,
        locale: "tr_TR",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: ogBaslik,
        description: proje.aciklama,
    },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html
            lang={proje.dil}
            className={cn("dark h-full antialiased font-sans", outfit.variable, geistMono.variable)}
            suppressHydrationWarning
        >
            <body className="min-h-full flex flex-col">{children}</body>
        </html>
    );
}
