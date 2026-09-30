"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { posterUrl, type PosterOge } from "@/lib/tmdb/gorsel";
import { Paralaks } from "./paralaks";
import s from "./poster-duvari.module.css";

const SUTUN_SAYISI = 10;
const GOSTERILECEK = 80;

// Her sütuna farklı hız ve başlangıç verilir ki duvar tekdüze akmasın
const sutunAyari = (i: number) => ({
    "--sure": `${62 + ((i * 17) % 5) * 9}s`,
    "--gecikme": `-${(i * 13) % 40}s`,
}) as React.CSSProperties;

// Fisher–Yates: havuzu karıştırıp ilk n tanesini alır
function rastgeleSec<T>(havuz: T[], n: number) {
    const dizi = [...havuz];
    for (let i = dizi.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dizi[i], dizi[j]] = [dizi[j], dizi[i]];
    }
    return dizi.slice(0, n);
}

// Seçim tarayıcıda yapılır ki her ziyarette farklı posterler/sıra gelsin. Sunucuda
// rastgele üretilseydi tarayıcıdaki sonuçla uyuşmaz (hydration hatası); bu yüzden
// duvar sayfa açıldıktan hemen sonra solarak belirir. Kart bundan etkilenmez.
export function PosterDuvari({ havuz }: { havuz: PosterOge[] }) {
    const [sutunlar, setSutunlar] = useState<PosterOge[][] | null>(null);

    useEffect(() => {
        const secilen = rastgeleSec(havuz, GOSTERILECEK);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- rastgelelik yalnızca tarayıcıda, bir kez
        setSutunlar(
            Array.from({ length: SUTUN_SAYISI }, (_, i) => secilen.filter((_, j) => j % SUTUN_SAYISI === i)),
        );
    }, [havuz]);

    return (
        <div className={s.sahne} aria-hidden>
            <div className={s.isima} />
            {sutunlar && (
                <Paralaks className={cn(s.duvar, s.belir)}>
                    {sutunlar.map((sutun, i) => (
                        <div key={i} className={cn(s.sutun, i % 2 === 1 && s.ters)} style={sutunAyari(i)}>
                            <div className={s.serit}>
                                {[...sutun, ...sutun].map((oge, j) => (
                                    <PosterKart key={`${oge.tip}-${oge.id}-${j}`} oge={oge} />
                                ))}
                            </div>
                        </div>
                    ))}
                </Paralaks>
            )}
            <div className={s.karartma} />
        </div>
    );
}

function PosterKart({ oge }: { oge: PosterOge }) {
    return (
        <div className={s.poster}>
            <Image
                src={posterUrl(oge.posterPath)}
                alt=""
                width={342}
                height={513}
                unoptimized
                // Sütunlar rastgele konumdan başladığı için hangi posterin ilk görüneceği
                // belli değil; hepsi hemen yüklenir (kopyalar aynı URL'i önbellekten alır).
                loading="eager"
                draggable={false}
            />
            <div className={s.bilgi}>
                <span className="mb-1 inline-block rounded-full bg-violet-500/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-200">
                    {oge.tip}
                </span>
                <p className="line-clamp-2 text-sm font-bold leading-tight text-white">{oge.baslik}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-white/70">
                    {oge.yil && <span>{oge.yil}</span>}
                    {oge.puan > 0 && (
                        <span className="flex items-center gap-0.5">
                            <Star className="size-3 fill-amber-400 text-amber-400" />
                            {oge.puan.toFixed(1)}
                        </span>
                    )}
                </p>
            </div>
        </div>
    );
}
