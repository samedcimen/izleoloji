import Image from "next/image";
import Link from "next/link";
import { icerikYolu, posterUrl, type IcerikKarti } from "@/lib/tmdb/gorsel";
import { Serit } from "@/components/icerik/serit";

// Büyük numaralı Top 10 şeridi: numara posterin arkasında, kontur yazıyla
export function Top10({ baslik, aciklama, icerikler }: { baslik: string; aciklama?: string; icerikler: IcerikKarti[] }) {
    if (icerikler.length === 0) return null;
    return (
        <Serit baslik={baslik} aciklama={aciklama}>
            {icerikler.map((o, i) => (
                <Link key={`${o.tip}-${o.id}`} href={icerikYolu(o)} className="group flex shrink-0 snap-start items-end" aria-label={`${i + 1}. ${o.baslik}`}>
                    <span
                        aria-hidden
                        className="-mr-4 select-none text-[7rem] font-black leading-[0.78] tracking-tighter text-transparent transition group-hover:[-webkit-text-stroke-color:rgb(167_139_250)] sm:-mr-5 sm:text-[9rem]"
                        style={{ WebkitTextStroke: "3px rgb(255 255 255 / 0.28)" }}
                    >
                        {i + 1}
                    </span>
                    <div className="relative aspect-2/3 w-28 overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 transition duration-300 group-hover:-translate-y-1 group-hover:ring-violet-400/70 sm:w-32">
                        {o.posterPath && (
                            <Image src={posterUrl(o.posterPath)} alt="" fill sizes="128px" unoptimized className="object-cover transition duration-500 group-hover:scale-105" />
                        )}
                    </div>
                </Link>
            ))}
        </Serit>
    );
}
