import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { arkaPlanUrl, icerikYolu, posterUrl, type IcerikKarti } from "@/lib/tmdb/gorsel";

// "Kaldığın yerden devam et" kartı: geniş arka plan, sıradaki bölüm ve ilerleme çubuğu
export function DevamKarti({ kart, siradaki, izlenen, toplam }: {
    kart: IcerikKarti;
    siradaki: [number, number] | null;
    izlenen: number;
    toplam: number;
}) {
    const yuzde = toplam ? Math.round((izlenen / toplam) * 100) : 0;
    const gorsel = kart.arkaPlanPath ? arkaPlanUrl(kart.arkaPlanPath, "w780") : kart.posterPath ? posterUrl(kart.posterPath) : null;
    return (
        <Link href={icerikYolu(kart)} className="group block w-72 shrink-0 snap-start sm:w-80">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-foreground/5 ring-1 ring-foreground/10 transition duration-300 group-hover:-translate-y-1 group-hover:ring-sky-400/70">
                {gorsel && <Image src={gorsel} alt="" fill unoptimized sizes="320px" className="object-cover transition duration-500 group-hover:scale-105" />}
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />
                <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white opacity-0 ring-1 ring-white/30 backdrop-blur transition group-hover:opacity-100">
                    <Play className="size-5 fill-current" />
                </span>
                <div className="absolute inset-x-3 bottom-3">
                    <p className="line-clamp-1 font-bold text-white">{kart.baslik}</p>
                    <p className="text-xs font-semibold text-sky-300">
                        {siradaki ? `Sıradaki: S${siradaki[0]} · B${siradaki[1]}` : "Yeni bölüm bekleniyor"}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
                            <div className="h-full rounded-full bg-sky-400" style={{ width: `${yuzde}%` }} />
                        </div>
                        <span className="text-[11px] font-semibold text-white/70">{izlenen}/{toplam}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
