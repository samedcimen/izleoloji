import Image from "next/image";
import { Star } from "lucide-react";
import { arkaPlanUrl, logoUrl } from "@/lib/tmdb/gorsel";
import type { DiziDetay, FilmDetay } from "@/lib/tmdb/detay";

// Detay sayfasının sinematik üst kısmı: tam genişlikte arka plan, varsa başlık logosu,
// bilgi satırı, slogan ve aksiyonlar. Ana sayfa vitriniyle aynı görsel dil.
// aksiyonlar: izleme paneli (KayitPaneli) — sayfa kullanıcının kaydıyla birlikte verir
export function DetayVitrin({ d, bilgiler, aksiyonlar }: { d: FilmDetay | DiziDetay; bilgiler: (string | null)[]; aksiyonlar: React.ReactNode }) {
    return (
        <section className="relative isolate flex min-h-[72svh] items-end overflow-hidden lg:min-h-[78svh]">
            {d.arkaPlanPath && (
                <Image src={arkaPlanUrl(d.arkaPlanPath)} alt="" fill priority unoptimized className="-z-10 animate-[vitrinYakinlas_9s_ease-out_forwards] object-cover object-top" />
            )}
            <div className="absolute inset-0 -z-10 bg-linear-to-r from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 -z-10 bg-linear-to-t from-background via-background/30 to-black/40" />

            <div className="w-full px-4 pb-14 pt-28 sm:px-8 md:pb-32">
                <div className="max-w-2xl animate-[vitrinBelir_0.7s_ease-out]">
                    {d.logoPath ? (
                        <h1 className="mb-5">
                            <span className="sr-only">{d.baslik}</span>
                            <Image
                                src={logoUrl(d.logoPath)}
                                alt=""
                                width={500}
                                height={200}
                                unoptimized
                                priority
                                className="h-auto max-h-28 w-auto max-w-[85%] object-contain object-left drop-shadow-[0_4px_24px_rgb(0_0_0/0.6)] sm:max-h-36"
                            />
                        </h1>
                    ) : (
                        <h1 className="mb-4 text-4xl font-black leading-[1.05] tracking-tight drop-shadow-lg sm:text-6xl">{d.baslik}</h1>
                    )}

                    {d.orijinalBaslik && d.orijinalBaslik !== d.baslik && <p className="-mt-2 mb-3 text-sm text-white/55">{d.orijinalBaslik}</p>}

                    <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-white/80">
                        {d.yasSiniri && <span className="rounded border border-white/40 px-1.5 py-px text-xs font-semibold">{d.yasSiniri}</span>}
                        {d.puan > 0 && (
                            <span className="flex items-center gap-1 font-semibold text-white">
                                <Star className="size-4 fill-amber-400 text-amber-400" />
                                {d.puan.toFixed(1)}
                                <span className="font-normal text-white/50">({d.oySayisi.toLocaleString("tr-TR")})</span>
                            </span>
                        )}
                        {bilgiler.filter(Boolean).map((b) => <span key={b}>{b}</span>)}
                    </div>

                    {d.turler.length > 0 && (
                        <div className="mb-5 flex flex-wrap gap-2">
                            {d.turler.map((t) => (
                                <span key={t.id} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur">
                                    {t.ad}
                                </span>
                            ))}
                        </div>
                    )}

                    {d.slogan && <p className="mb-6 text-base italic text-violet-200/90">“{d.slogan}”</p>}

                    {aksiyonlar}
                </div>
            </div>
        </section>
    );
}
