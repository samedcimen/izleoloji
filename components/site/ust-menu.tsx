"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { cikisYap } from "@/app/actions/oturum";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type MenuKullanici = { ad: string | null; kullaniciAdi: string | null; resim: string | null };

// Sayfalar geldikçe buraya eklenecek (Keşfet, Listelerim, Akış...)
const BAGLANTILAR = [{ ad: "Ana sayfa", href: "/" }];

// Sayfanın üstündeyken şeffaf (vitrinin üstünde), aşağı kaydırınca buzlu cam zemin
export function UstMenu({ kullanici }: { kullanici: MenuKullanici }) {
    const yol = usePathname();
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
                "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
                kaydi ? "border-b border-white/10 bg-background/80 backdrop-blur-xl" : "bg-linear-to-b from-black/60 to-transparent",
            )}
        >
            <div className="flex h-16 items-center gap-8 px-4 sm:px-8">
                <Link href="/" className="text-2xl font-black tracking-tight">
                    <span className="text-white">izle</span>
                    <span className="bg-linear-to-br from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">oloji</span>
                </Link>

                <nav className="hidden items-center gap-1 md:flex">
                    {BAGLANTILAR.map((b) => (
                        <Link
                            key={b.href}
                            href={b.href}
                            aria-current={yol === b.href ? "page" : undefined}
                            className={cn(
                                "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                                yol === b.href ? "bg-white/10 text-white" : "text-white/65 hover:text-white",
                            )}
                        >
                            {b.ad}
                        </Link>
                    ))}
                </nav>

                <div className="ml-auto">
                    <KullaniciMenusu kullanici={kullanici} />
                </div>
            </div>
        </header>
    );
}

function KullaniciMenusu({ kullanici }: { kullanici: MenuKullanici }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className="flex items-center gap-2 rounded-full p-0.5 ring-2 ring-transparent transition hover:ring-violet-400/60 focus-visible:ring-violet-400 focus-visible:outline-none"
                aria-label="Hesap menüsü"
            >
                {kullanici.resim ? (
                    // eslint-disable-next-line @next/next/no-img-element -- küçük yerel/OAuth avatarı
                    <img src={kullanici.resim} alt="" className="size-9 rounded-full bg-white/10 object-cover" />
                ) : (
                    <span className="grid size-9 place-items-center rounded-full bg-violet-600 text-sm font-bold">
                        {(kullanici.ad ?? "?").slice(0, 1).toLocaleUpperCase("tr-TR")}
                    </span>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-56">
                <DropdownMenuLabel className="px-2 py-1.5">
                    <p className="truncate text-sm font-semibold">{kullanici.ad ?? "İzleyici"}</p>
                    {kullanici.kullaniciAdi && <p className="truncate text-xs font-normal text-muted-foreground">@{kullanici.kullaniciAdi}</p>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => cikisYap()}>
                    <LogOut />
                    Çıkış yap
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
