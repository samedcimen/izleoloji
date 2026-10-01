import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { icerikYolu, posterUrl, type IcerikKarti } from "@/lib/tmdb/gorsel";

export const KART_GENISLIK = "w-[8.5rem] sm:w-36 md:w-40 lg:w-44";

export function PosterKarti({ icerik, oncelikli, className }: { icerik: IcerikKarti; oncelikli?: boolean; className?: string }) {
    return (
        <Link href={icerikYolu(icerik)} className={cn("group block shrink-0 snap-start", KART_GENISLIK, className)}>
            <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-foreground/5 ring-1 ring-foreground/10 transition duration-300 group-hover:-translate-y-1 group-hover:ring-violet-400/70 group-hover:shadow-[0_18px_40px_-14px_rgb(124_58_237/0.6)]">
                {icerik.posterPath ? (
                    <Image
                        src={posterUrl(icerik.posterPath)}
                        alt={icerik.baslik}
                        fill
                        sizes="176px"
                        unoptimized
                        loading={oncelikli ? "eager" : "lazy"}
                        className="object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="grid size-full place-items-center p-3 text-center text-xs text-foreground/40">{icerik.baslik}</div>
                )}
                {icerik.puan > 0 && (
                    <span className="absolute left-2 top-2 flex items-center gap-0.5 rounded-full bg-black/65 px-1.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        {icerik.puan.toFixed(1)}
                    </span>
                )}
            </div>
            <p className="mt-2 line-clamp-1 text-sm font-semibold text-foreground/90 transition group-hover:text-violet-300">{icerik.baslik}</p>
            <p className="text-xs text-foreground/45">
                {icerik.tip === "film" ? "Film" : "Dizi"}
                {icerik.yil && ` · ${icerik.yil}`}
            </p>
        </Link>
    );
}

export function PosterKartiIskelet() {
    return (
        <div className={cn("shrink-0", KART_GENISLIK)}>
            <div className="aspect-2/3 animate-pulse rounded-xl bg-foreground/5" />
            <div className="mt-2 h-3.5 w-3/4 animate-pulse rounded bg-foreground/5" />
            <div className="mt-1.5 h-3 w-1/3 animate-pulse rounded bg-foreground/5" />
        </div>
    );
}
