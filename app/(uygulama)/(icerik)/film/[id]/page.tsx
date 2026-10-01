import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Layers } from "lucide-react";
import { filmDetay } from "@/lib/tmdb/detay";
import { arkaPlanUrl } from "@/lib/tmdb/gorsel";
import { paraMetni, sureMetni, tarihMetni } from "@/lib/bicim";
import { DetayVitrin } from "@/components/detay/detay-vitrin";
import { BilgiBolumu, KisiBaglantilari, type Bilgi } from "@/components/detay/bilgi-bolumu";
import { KisiSeridi } from "@/components/detay/kisi-seridi";
import { FragmanSeridi } from "@/components/detay/fragman-seridi";
import { Serit } from "@/components/icerik/serit";
import { PosterKarti } from "@/components/icerik/poster-karti";

async function filmAl(param: string) {
    const id = Number(param);
    if (!Number.isInteger(id) || id <= 0) notFound();
    const film = await filmDetay(id);
    if (!film) notFound();
    return film;
}

export async function generateMetadata({ params }: PageProps<"/film/[id]">): Promise<Metadata> {
    const f = await filmAl((await params).id);
    const baslik = f.yil ? `${f.baslik} (${f.yil})` : f.baslik;
    return {
        title: baslik,
        description: f.ozet.slice(0, 160) || undefined,
        openGraph: { title: baslik, images: f.arkaPlanPath ? [arkaPlanUrl(f.arkaPlanPath)] : undefined },
    };
}

export default async function FilmSayfasi({ params }: PageProps<"/film/[id]">) {
    const f = await filmAl((await params).id);

    const bilgiler = ([
        f.yonetmenler.length ? { etiket: f.yonetmenler.length > 1 ? "Yönetmenler" : "Yönetmen", deger: <KisiBaglantilari kisiler={f.yonetmenler} /> } : null,
        f.senaristler.length ? { etiket: "Senaryo", deger: <KisiBaglantilari kisiler={f.senaristler} /> } : null,
        f.tarih ? { etiket: "Vizyon tarihi", deger: tarihMetni(f.tarih) } : null,
        f.sure ? { etiket: "Süre", deger: sureMetni(f.sure) } : null,
        f.dil ? { etiket: "Orijinal dil", deger: f.dil } : null,
        f.ulkeler.length ? { etiket: "Ülke", deger: f.ulkeler.join(", ") } : null,
        f.butce ? { etiket: "Bütçe", deger: paraMetni(f.butce) } : null,
        f.hasilat ? { etiket: "Hasılat", deger: paraMetni(f.hasilat) } : null,
    ] as (Bilgi | null)[]).filter((b): b is Bilgi => !!b);

    return (
        <main className="pb-20">
            <DetayVitrin d={f} bilgiler={[f.yil ? String(f.yil) : null, sureMetni(f.sure)]} />

            <div className="space-y-14">
                <BilgiBolumu baslik={f.baslik} posterPath={f.posterPath} ozet={f.ozet} bilgiler={bilgiler} platformlar={f.platformlar} />

                <KisiSeridi baslik="Oyuncular" kisiler={f.oyuncular} />

                <FragmanSeridi baslik={f.baslik} fragmanlar={f.fragmanlar} />

                {f.seri && (
                    <section className="px-4 sm:px-8">
                        <div className="relative isolate flex min-h-40 items-center overflow-hidden rounded-3xl p-6 ring-1 ring-white/10 sm:p-8">
                            {f.seri.arkaPlanPath && <Image src={arkaPlanUrl(f.seri.arkaPlanPath, "w780")} alt="" fill unoptimized className="-z-10 object-cover" />}
                            <div className="absolute inset-0 -z-10 bg-linear-to-r from-black/90 via-black/70 to-black/20" />
                            <div>
                                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-violet-200"><Layers className="size-3.5" />Film serisi</p>
                                <p className="text-2xl font-black tracking-tight">{f.seri.ad}</p>
                                <p className="mt-1 text-sm text-white/60">Bu film {f.seri.ad} serisinin bir parçası.</p>
                            </div>
                        </div>
                    </section>
                )}

                {f.oneriler.length > 0 && (
                    <Serit baslik="Bunu beğenenler bunları da izledi">
                        {f.oneriler.map((o) => <PosterKarti key={`${o.tip}-${o.id}`} icerik={o} />)}
                    </Serit>
                )}
                {f.benzerler.length > 0 && (
                    <Serit baslik="Benzer filmler">
                        {f.benzerler.map((o) => <PosterKarti key={`${o.tip}-${o.id}`} icerik={o} />)}
                    </Serit>
                )}
            </div>
        </main>
    );
}
