import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ExternalLink, UserRound } from "lucide-react";
import { kisiDetay } from "@/lib/tmdb/detay";
import { arkaPlanUrl, profilUrl } from "@/lib/tmdb/gorsel";
import { tarihMetni, yasHesapla } from "@/lib/bicim";
import { Biyografi } from "@/components/detay/biyografi";
import { Filmografi } from "@/components/detay/filmografi";
import { Serit } from "@/components/icerik/serit";
import { PosterKarti } from "@/components/icerik/poster-karti";

async function kisiAl(param: string) {
    const id = Number(param);
    if (!Number.isInteger(id) || id <= 0) notFound();
    const kisi = await kisiDetay(id);
    if (!kisi) notFound();
    return kisi;
}

export async function generateMetadata({ params }: PageProps<"/oyuncu/[id]">): Promise<Metadata> {
    const k = await kisiAl((await params).id);
    return {
        title: k.ad,
        description: k.biyografi.slice(0, 160) || undefined,
        openGraph: { title: k.ad, images: k.profilPath ? [profilUrl(k.profilPath, "h632")] : undefined },
    };
}

export default async function OyuncuSayfasi({ params }: PageProps<"/oyuncu/[id]">) {
    const k = await kisiAl((await params).id);
    // Kişinin kendi arka plan görseli yok; en bilinen işinin görseli bulanık zemin olur
    const zemin = k.bilinenIsler.find((i) => i.arkaPlanPath)?.arkaPlanPath ?? null;

    const bilgiler = [
        k.bilinenAlan && { etiket: "Bilinen alanı", deger: k.bilinenAlan },
        k.dogum && { etiket: "Doğum tarihi", deger: `${tarihMetni(k.dogum)}${k.olum ? "" : ` (${yasHesapla(k.dogum)} yaşında)`}` },
        k.olum && { etiket: "Ölüm tarihi", deger: `${tarihMetni(k.olum)}${k.dogum ? ` (${yasHesapla(k.dogum, k.olum)} yaşında)` : ""}` },
        k.dogumYeri && { etiket: "Doğum yeri", deger: k.dogumYeri },
        { etiket: "Yapım sayısı", deger: `${k.filmler.length} film · ${k.diziler.length} dizi` },
    ].filter((b): b is { etiket: string; deger: string } => !!b);

    return (
        <main className="pb-20">
            <section className="relative isolate overflow-hidden px-4 pb-10 pt-28 sm:px-8 lg:pt-20">
                {zemin && <Image src={arkaPlanUrl(zemin, "w780")} alt="" fill unoptimized priority className="-z-10 scale-110 object-cover opacity-30 blur-2xl" />}
                <div className="absolute inset-0 -z-10 bg-linear-to-b from-background/40 via-background/70 to-background" />

                <div className="flex flex-col gap-8 md:flex-row md:items-end">
                    <div className="relative aspect-2/3 w-44 shrink-0 overflow-hidden rounded-2xl bg-white/5 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.9)] ring-1 ring-white/10 sm:w-56">
                        {k.profilPath ? (
                            <Image src={profilUrl(k.profilPath, "h632")} alt={k.ad} fill unoptimized priority sizes="224px" className="object-cover" />
                        ) : (
                            <UserRound className="absolute inset-0 m-auto size-16 text-white/20" />
                        )}
                    </div>
                    <div className="min-w-0 pb-2">
                        {k.bilinenAlan && <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-violet-300">{k.bilinenAlan}</p>}
                        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{k.ad}</h1>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {k.imdbId && (
                                <a href={`https://www.imdb.com/name/${k.imdbId}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/10">
                                    IMDb <ExternalLink className="size-3" />
                                </a>
                            )}
                            {k.instagram && (
                                <a href={`https://www.instagram.com/${k.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/10">
                                    Instagram <ExternalLink className="size-3" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <div className="space-y-14">
                <section className="grid gap-8 px-4 sm:px-8 lg:grid-cols-[1fr_18rem] lg:gap-12">
                    <div>
                        <h2 className="mb-2 text-lg font-bold">Biyografi</h2>
                        {k.biyografi ? <Biyografi metin={k.biyografi} /> : <p className="text-foreground/50">Bu kişi için henüz bir biyografi girilmemiş.</p>}
                    </div>
                    <dl className="grid h-fit grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:grid-cols-1">
                        {bilgiler.map((b) => (
                            <div key={b.etiket}>
                                <dt className="text-xs font-semibold uppercase tracking-wider text-foreground/40">{b.etiket}</dt>
                                <dd className="mt-1 text-sm font-medium">{b.deger}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                {k.bilinenIsler.length > 0 && (
                    <Serit baslik="En bilinen işleri">
                        {k.bilinenIsler.map((o) => <PosterKarti key={`${o.tip}-${o.id}`} icerik={o} />)}
                    </Serit>
                )}

                <Filmografi filmler={k.filmler} diziler={k.diziler} />
            </div>
        </main>
    );
}
