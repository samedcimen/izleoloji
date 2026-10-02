import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { diziDetay, sezonDetay } from "@/lib/tmdb/detay";
import { arkaPlanUrl } from "@/lib/tmdb/gorsel";
import { sureMetni, tarihMetni } from "@/lib/bicim";
import { DetayVitrin } from "@/components/detay/detay-vitrin";
import { BilgiBolumu, KisiBaglantilari, type Bilgi } from "@/components/detay/bilgi-bolumu";
import { KisiSeridi } from "@/components/detay/kisi-seridi";
import { FragmanSeridi } from "@/components/detay/fragman-seridi";
import { Sezonlar } from "@/components/detay/sezonlar";
import { Serit } from "@/components/icerik/serit";
import { PosterKarti } from "@/components/icerik/poster-karti";
import { KayitPaneli } from "@/components/detay/kayit-paneli";
import { oturumAl } from "@/lib/oturum";
import { BOS_KAYIT, durumHaritasi, icerikListeleri, izlenenBolumler, kayitDurumu, yayinlanmisBolumler } from "@/lib/kutuphane";

async function diziAl(param: string) {
    const id = Number(param);
    if (!Number.isInteger(id) || id <= 0) notFound();
    const dizi = await diziDetay(id);
    if (!dizi) notFound();
    return dizi;
}

export async function generateMetadata({ params }: PageProps<"/dizi/[id]">): Promise<Metadata> {
    const d = await diziAl((await params).id);
    const baslik = d.yil ? `${d.baslik} (${d.yil})` : d.baslik;
    return {
        title: baslik,
        description: d.ozet.slice(0, 160) || undefined,
        openGraph: { title: baslik, images: d.arkaPlanPath ? [arkaPlanUrl(d.arkaPlanPath)] : undefined },
    };
}

export default async function DiziSayfasi({ params }: PageProps<"/dizi/[id]">) {
    const d = await diziAl((await params).id);

    // İlk açılan sezon: yayında olan son normal sezon (0 = özel bölümler)
    const normal = d.sezonlar.filter((s) => s.no > 0);
    const buYil = new Date().getFullYear();
    const ilkNo = d.sonrakiBolum?.sezon ?? [...normal].reverse().find((s) => (s.yil ?? 0) <= buYil)?.no ?? normal[0]?.no ?? d.sezonlar[0]?.no;
    const userId = (await oturumAl())?.user?.id;
    const anahtar = { tmdbId: d.id, tip: "dizi" as const };
    const izlenenler = userId ? await izlenenBolumler(userId, d.id) : [];
    // Bölüm izlemeye başlamışsa sayfa, sıradaki izlenmemiş bölümün sezonuyla açılır
    let acilisNo = ilkNo;
    if (izlenenler.length) {
        const izlenenSet = new Set(izlenenler);
        const siradaki = (await yayinlanmisBolumler(d.id)).find(([s, b]) => !izlenenSet.has(`${s}-${b}`));
        if (siradaki) acilisNo = siradaki[0];
    }
    const [ilkSezon, kayit, listeler, durumlar] = await Promise.all([
        acilisNo !== undefined ? sezonDetay(d.id, acilisNo) : null,
        userId ? kayitDurumu(userId, anahtar) : BOS_KAYIT,
        userId ? icerikListeleri(userId, anahtar) : [],
        durumHaritasi(userId, [...d.oneriler, ...d.benzerler]),
    ]);

    const bilgiler = ([
        d.yaraticilar.length ? { etiket: "Yaratıcı", deger: <KisiBaglantilari kisiler={d.yaraticilar} /> } : null,
        d.kanallar.length ? { etiket: "Kanal", deger: d.kanallar.map((k) => k.ad).join(", ") } : null,
        d.durum ? { etiket: "Durum", deger: d.durum } : null,
        d.tarih ? { etiket: "İlk yayın", deger: tarihMetni(d.tarih) } : null,
        { etiket: "Sezon / bölüm", deger: `${d.sezonSayisi} sezon · ${d.bolumSayisi} bölüm` },
        d.bolumSuresi ? { etiket: "Bölüm süresi", deger: sureMetni(d.bolumSuresi) } : null,
        d.dil ? { etiket: "Orijinal dil", deger: d.dil } : null,
        d.ulkeler.length ? { etiket: "Ülke", deger: d.ulkeler.join(", ") } : null,
    ] as (Bilgi | null)[]).filter((b): b is Bilgi => !!b);

    return (
        <main className="pb-20">
            <DetayVitrin
                d={d}
                bilgiler={[d.yil ? String(d.yil) : null, `${d.sezonSayisi} sezon`, d.durum]}
                aksiyonlar={
                    <KayitPaneli key={JSON.stringify(kayit)} tip="dizi" tmdbId={d.id} baslik={d.baslik} fragmanKey={d.fragmanlar[0]?.key ?? null} girisli={!!userId} ilk={kayit} listeler={listeler} />
                }
            />

            <div className="space-y-14">
                <BilgiBolumu baslik={d.baslik} posterPath={d.posterPath} ozet={d.ozet} bilgiler={bilgiler} platformlar={d.platformlar} />

                {d.sonrakiBolum && (
                    <div className="mx-4 flex items-center gap-3 rounded-2xl border border-violet-400/25 bg-violet-500/10 px-5 py-4 sm:mx-8">
                        <CalendarClock className="size-5 shrink-0 text-violet-300" />
                        <p className="text-sm">
                            <span className="font-semibold">Sıradaki bölüm:</span> {d.sonrakiBolum.sezon}. sezon {d.sonrakiBolum.bolum}. bölüm
                            {d.sonrakiBolum.ad && ` — ${d.sonrakiBolum.ad}`}
                            {d.sonrakiBolum.tarih && <span className="text-foreground/60"> · {tarihMetni(d.sonrakiBolum.tarih)}</span>}
                        </p>
                    </div>
                )}

                <Sezonlar diziId={d.id} sezonlar={d.sezonlar} ilkSezon={ilkSezon} girisli={!!userId} izlenenler={izlenenler} />

                <KisiSeridi baslik="Oyuncular" kisiler={d.oyuncular} />

                <FragmanSeridi baslik={d.baslik} fragmanlar={d.fragmanlar} />

                {d.oneriler.length > 0 && (
                    <Serit baslik="Bunu beğenenler bunları da izledi">
                        {d.oneriler.map((o) => <PosterKarti key={`${o.tip}-${o.id}`} icerik={o} durum={durumlar[`${o.tip}-${o.id}`]} />)}
                    </Serit>
                )}
                {d.benzerler.length > 0 && (
                    <Serit baslik="Benzer diziler">
                        {d.benzerler.map((o) => <PosterKarti key={`${o.tip}-${o.id}`} icerik={o} durum={durumlar[`${o.tip}-${o.id}`]} />)}
                    </Serit>
                )}
            </div>
        </main>
    );
}
