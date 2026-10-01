import Image from "next/image";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { profilUrl } from "@/lib/tmdb/gorsel";
import type { Kisi } from "@/lib/tmdb/detay";
import { Serit } from "@/components/icerik/serit";

// Oyuncu kadrosu: yuvarlak fotoğraflı kartlar, oyuncu sayfasına gider
export function KisiSeridi({ baslik, kisiler }: { baslik: string; kisiler: Kisi[] }) {
    if (kisiler.length === 0) return null;
    return (
        <Serit baslik={baslik}>
            {kisiler.map((k) => (
                <Link key={`${k.id}-${k.rol}`} href={`/oyuncu/${k.id}`} className="group w-28 shrink-0 snap-start text-center sm:w-32">
                    <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-full bg-white/5 ring-2 ring-white/10 transition duration-300 group-hover:ring-violet-400">
                        {k.profilPath ? (
                            <Image src={profilUrl(k.profilPath)} alt={k.ad} fill unoptimized sizes="128px" className="object-cover transition duration-500 group-hover:scale-105" />
                        ) : (
                            <UserRound className="absolute inset-0 m-auto size-10 text-white/25" />
                        )}
                    </div>
                    <p className="mt-2.5 line-clamp-1 text-sm font-semibold transition group-hover:text-violet-300">{k.ad}</p>
                    {k.rol && <p className="line-clamp-1 text-xs text-foreground/45">{k.rol}</p>}
                </Link>
            ))}
        </Serit>
    );
}
