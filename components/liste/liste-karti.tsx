import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { posterUrl } from "@/lib/tmdb/gorsel";

// Liste kartı: ilk 4 içeriğin posterinden yelpaze kolaj, ad ve içerik sayısı
export function ListeKarti({ href, ad, aciklama, sayi, posterler, renk, gizli }: {
    href: string;
    ad: string;
    aciklama?: string | null;
    sayi: number;
    posterler: string[];
    renk?: string;
    gizli?: boolean;
}) {
    return (
        <Link href={href} className="group block">
            <div className={cn("relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-white/10 transition duration-300 group-hover:-translate-y-1 group-hover:ring-violet-400/60", renk ? `bg-linear-to-br ${renk}` : "bg-white/5")}>
                {posterler.length > 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        {posterler.slice(0, 4).map((p, i, dizi) => {
                            const orta = (dizi.length - 1) / 2;
                            const kayma = (i - orta) * 22;
                            return (
                                <div
                                    key={p}
                                    className="absolute aspect-2/3 w-[34%] overflow-hidden rounded-lg shadow-[0_10px_30px_-8px_rgb(0_0_0/0.8)] ring-1 ring-black/30 transition duration-500 group-hover:scale-105"
                                    style={{ transform: `translateX(${kayma}%) rotate(${(i - orta) * 6}deg)`, zIndex: 10 - Math.abs(Math.round(i - orta)) }}
                                >
                                    <Image src={posterUrl(p, "w185")} alt="" fill unoptimized sizes="120px" className="object-cover" />
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="absolute inset-0 grid place-items-center text-sm text-white/50">Henüz boş</div>
                )}
                {gizli && (
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">
                        <Lock className="size-3" /> Gizli
                    </span>
                )}
            </div>
            <p className="mt-3 line-clamp-1 font-bold transition group-hover:text-violet-300">{ad}</p>
            <p className="line-clamp-1 text-sm text-foreground/50">
                {sayi} içerik{aciklama ? ` · ${aciklama}` : ""}
            </p>
        </Link>
    );
}
