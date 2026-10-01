import { anaSayfaVerisi, turIcerikleri } from "@/lib/tmdb/ana-sayfa";
import { KESIF_TURLERI } from "@/lib/tmdb/turler";
import { UstMenu, type MenuKullanici } from "@/components/site/ust-menu";
import { YanMenu } from "@/components/site/yan-menu";
import { YAN_MENU_GENISLIK } from "@/lib/ayarlar/menu";
import { db } from "@/lib/db";
import { seviyeHesapla } from "@/lib/seviye";
import { Serit } from "@/components/icerik/serit";
import { PosterKarti } from "@/components/icerik/poster-karti";
import { Vitrin } from "./vitrin";
import { Top10 } from "./top10";
import { PlatformSeridi } from "./platform-seridi";
import { TurSeridi } from "./tur-seridi";

// Giriş yapmış kullanıcının ana sayfası. TMDB verisi tek önbellek kaydından gelir (6 saatte bir yenilenir).
// "Kaldığın yerden" ve "arkadaşların ne izledi" bölümleri izleme kaydı ve takip geldiğinde (aşama 4-5) eklenecek.
export async function GirisliAnaSayfa({ kullanici, kullaniciId }: { kullanici: MenuKullanici; kullaniciId: string }) {
    const ilkTur = KESIF_TURLERI[0];
    const [veri, turIlk, xp] = await Promise.all([
        anaSayfaVerisi(),
        turIcerikleri(ilkTur.film, ilkTur.dizi),
        db.user.findUnique({ where: { id: kullaniciId }, select: { xp: true } }).then((u) => u?.xp ?? 0),
    ]);

    return (
        <div className={`min-h-dvh bg-background text-foreground ${YAN_MENU_GENISLIK}`}>
            <YanMenu kullanici={kullanici} seviye={seviyeHesapla(xp)} />
            <UstMenu kullanici={kullanici} seviye={seviyeHesapla(xp)} />
            <main>
                <Vitrin ogeler={veri.vitrin} />

                <div className="relative z-10 -mt-10 space-y-12 pb-20 sm:space-y-14">
                    <Top10 baslik="Bu hafta yerli Top 10" aciklama="En popüler Türk film ve dizileri" icerikler={veri.yerliTop10} />

                    <PlatformSeridi platformlar={veri.platformlar} />

                    {veri.vizyonda.length > 0 && (
                        <Serit baslik="Vizyonda" aciklama="Türkiye'de şu an sinemalarda">
                            {veri.vizyonda.map((o, i) => <PosterKarti key={o.id} icerik={o} oncelikli={i < 6} />)}
                        </Serit>
                    )}

                    {veri.trendDiziler.length > 0 && (
                        <Serit baslik="Haftanın trend dizileri">
                            {veri.trendDiziler.map((o) => <PosterKarti key={o.id} icerik={o} />)}
                        </Serit>
                    )}

                    <TurSeridi ilkIcerikler={turIlk} />

                    {veri.yakinda.length > 0 && (
                        <Serit baslik="Yakında vizyonda" aciklama="Önümüzdeki haftalarda sinemalarda">
                            {veri.yakinda.map((o) => <PosterKarti key={o.id} icerik={o} />)}
                        </Serit>
                    )}

                    {veri.trendFilmler.length > 0 && (
                        <Serit baslik="Haftanın trend filmleri">
                            {veri.trendFilmler.map((o) => <PosterKarti key={o.id} icerik={o} />)}
                        </Serit>
                    )}
                </div>
            </main>
            <footer className="border-t border-foreground/10 px-4 py-8 text-center text-xs text-foreground/35 sm:px-8">
                Film ve dizi verileri ile görseller TMDB&apos;den sağlanır. Bu ürün TMDB tarafından onaylanmamıştır.
            </footer>
        </div>
    );
}
