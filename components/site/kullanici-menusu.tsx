"use client";

import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { cikisYap } from "@/app/actions/oturum";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type MenuKullanici = { ad: string | null; kullaniciAdi: string | null; resim: string | null };

export function Avatar({ kullanici, className }: { kullanici: MenuKullanici; className?: string }) {
    return kullanici.resim ? (
        // eslint-disable-next-line @next/next/no-img-element -- küçük yerel/OAuth avatarı
        <img src={kullanici.resim} alt="" className={cn("size-9 shrink-0 rounded-full bg-white/10 object-cover", className)} />
    ) : (
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-full bg-violet-600 text-sm font-bold", className)}>
            {(kullanici.ad ?? "?").slice(0, 1).toLocaleUpperCase("tr-TR")}
        </span>
    );
}

// Profil resmine tıklayınca açılan menü. tetikleyici: yan menüde avatar + isim, mobilde yalnız avatar.
// tetikleyiciSinif: yuvarlak avatar yerine kart tetikleyicide köşe/çerçeve ayarı
export function KullaniciMenusu({ kullanici, tetikleyici, yon = "bottom", tetikleyiciSinif }: {
    kullanici: MenuKullanici;
    tetikleyici?: React.ReactNode;
    yon?: "bottom" | "right" | "top";
    tetikleyiciSinif?: string;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={cn(
                    "flex w-full items-center gap-3 rounded-full p-0.5 text-left ring-2 ring-transparent transition hover:ring-violet-400/60 focus-visible:ring-violet-400 focus-visible:outline-none",
                    tetikleyiciSinif,
                )}
                aria-label="Hesap menüsü"
            >
                {tetikleyici ?? <Avatar kullanici={kullanici} />}
            </DropdownMenuTrigger>
            <DropdownMenuContent side={yon} align="end" sideOffset={10} className="w-56">
                {/* Base UI'de menü başlığı bir grup içinde olmak zorunda */}
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="px-2 py-1.5">
                        <p className="truncate text-sm font-semibold">{kullanici.ad ?? "İzleyici"}</p>
                        {kullanici.kullaniciAdi && <p className="truncate text-xs font-normal text-muted-foreground">@{kullanici.kullaniciAdi}</p>}
                    </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => cikisYap()}>
                    <LogOut />
                    Çıkış yap
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
