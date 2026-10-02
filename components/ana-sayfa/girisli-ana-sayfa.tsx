import Link from "next/link";
import { anaSayfaVerisi, turIcerikleri } from "@/lib/tmdb/ana-sayfa";
import { KESIF_TURLERI } from "@/lib/tmdb/turler";
import { Serit } from "@/components/icerik/serit";
import { PosterKarti } from "@/components/icerik/poster-karti";
import { Vitrin } from "./vitrin";
import { Top10 } from "./top10";
import { PlatformSeridi } from "./platform-seridi";
import { TurSeridi } from "./tur-seridi";
import { DevamKarti } from "./devam-karti";
import { durumHaritasi, devamEdilenler, ozelListeIcerikleri } from "@/lib/kutuphane";

// Giriş yapmış kullanıcının ana sayfası (menü ve alt bilgi app/(uygulama)/layout'taki iskeletten gelir).
// TMDB verisi tek önbellek kaydından gelir (6 saatte bir yenilenir).
// Kullanıcıya özel: "kaldığın yerden devam et", "izleme listen" ve kartlardaki durum rozetleri.
// "Arkadaşların ne izledi" takip geldiğinde (aşama 5) eklenecek.
export async function GirisliAnaSayfa({ userId }: { userId: string }) {
    const ilkTur = KESIF_TURLERI[0];
    const [veri, turIlk, devam, izlemeListesi] = await Promise.all([
        anaSayfaVerisi(),
        turIcerikleri(ilkTur.film, ilkTur.dizi),
        devamEdilenler(userId),
        ozelListeIcerikleri(userId, "sonra-izle").then((k) => k.slice(0, 20)),
    ]);
    const durumlar = await durumHaritasi(userId, [...veri.vizyonda, ...veri.trendDiziler, ...veri.yakinda, ...veri.trendFilmler]);
    const tumu = (
        <Link href="/listelerim/sonra-izle" className="shrink-0 text-sm font-semibold text-violet-300 transition hover:text-violet-200">
            Tümü
        </Link>
    );

    return (
        <main>
            <Vitrin ogeler={veri.vitrin} />

            <div className="relative z-10 -mt-10 space-y-12 pb-20 sm:space-y-14">
                {devam.length > 0 && (
                    <Serit baslik="Kaldığın yerden devam et">
                        {devam.map((d) => <DevamKarti key={d.kart.id} {...d} />)}
                    </Serit>
                )}

                {izlemeListesi.length > 0 && (
                    <Serit baslik="İzleme listen" aciklama="Sonra izlemek için ayırdıkların" sag={tumu}>
                        {izlemeListesi.map((o) => <PosterKarti key={`${o.tip}-${o.id}`} icerik={o} />)}
                    </Serit>
                )}

                <Top10 baslik="Bu hafta yerli Top 10" aciklama="En popüler Türk film ve dizileri" icerikler={veri.yerliTop10} />

                <PlatformSeridi platformlar={veri.platformlar} />

                {veri.vizyonda.length > 0 && (
                    <Serit baslik="Vizyonda" aciklama="Türkiye'de şu an sinemalarda">
                        {veri.vizyonda.map((o, i) => <PosterKarti key={o.id} icerik={o} oncelikli={i < 6} durum={durumlar[`${o.tip}-${o.id}`]} />)}
                    </Serit>
                )}

                {veri.trendDiziler.length > 0 && (
                    <Serit baslik="Haftanın trend dizileri">
                        {veri.trendDiziler.map((o) => <PosterKarti key={o.id} icerik={o} durum={durumlar[`${o.tip}-${o.id}`]} />)}
                    </Serit>
                )}

                <TurSeridi ilkIcerikler={turIlk} />

                {veri.yakinda.length > 0 && (
                    <Serit baslik="Yakında vizyonda" aciklama="Önümüzdeki haftalarda sinemalarda">
                        {veri.yakinda.map((o) => <PosterKarti key={o.id} icerik={o} durum={durumlar[`${o.tip}-${o.id}`]} />)}
                    </Serit>
                )}

                {veri.trendFilmler.length > 0 && (
                    <Serit baslik="Haftanın trend filmleri">
                        {veri.trendFilmler.map((o) => <PosterKarti key={o.id} icerik={o} durum={durumlar[`${o.tip}-${o.id}`]} />)}
                    </Serit>
                )}
            </div>
        </main>
    );
}
