import "server-only";
import { db } from "@/lib/db";
import { diziDetay, filmDetay, sezonDetay } from "@/lib/tmdb/detay";
import type { IcerikKarti, IcerikTipi } from "@/lib/tmdb/gorsel";

// Kullanıcının izleme kayıtları, bölümleri ve listeleri için ortak okuma yardımcıları.
// Listelerde gösterilen içeriklerin başlık/poster bilgisi IcerikOnbellek tablosundan gelir;
// böylece bir liste sayfası her öğe için TMDB'ye gitmez.

export type KayitDurumu = { durum: "izledi" | "izleyecek" | "izliyor" | null; puan: number | null; favori: boolean };
export const BOS_KAYIT: KayitDurumu = { durum: null, puan: null, favori: false };

type Anahtar = { tmdbId: number; tip: IcerikTipi };
export const anahtar = (o: Anahtar) => `${o.tip}-${o.tmdbId}`;

// ── İçerik önbelleği ─────────────────────────────────────────────────────────

export async function onbellegeYaz({ tmdbId, tip }: Anahtar) {
    const d = tip === "film" ? await filmDetay(tmdbId) : await diziDetay(tmdbId);
    if (!d) return false;
    const veri = {
        baslik: d.baslik,
        orijinalBaslik: d.orijinalBaslik || null,
        posterPath: d.posterPath,
        backdropPath: d.arkaPlanPath,
        yil: d.yil,
        turIds: JSON.stringify(d.turler.map((t) => t.id)),
    };
    await db.icerikOnbellek.upsert({
        where: { tmdbId_tip: { tmdbId, tip } },
        create: { tmdbId, tip, ...veri },
        update: veri,
    });
    return true;
}

// Verilen sırayla kart listesi; önbellekte olmayanlar TMDB'den çekilip yazılır
export async function kartlariGetir(ogeler: Anahtar[]): Promise<IcerikKarti[]> {
    if (ogeler.length === 0) return [];
    const bul = () =>
        db.icerikOnbellek.findMany({ where: { OR: ogeler.map((o) => ({ tmdbId: o.tmdbId, tip: o.tip })) } });

    let satirlar = await bul();
    const eksik = ogeler.filter((o) => !satirlar.some((s) => s.tmdbId === o.tmdbId && s.tip === o.tip));
    if (eksik.length) {
        // TMDB'yi yormamak için 5'erli gruplar
        for (let i = 0; i < eksik.length; i += 5) await Promise.all(eksik.slice(i, i + 5).map(onbellegeYaz));
        satirlar = await bul();
    }

    const harita = new Map(satirlar.map((s) => [`${s.tip}-${s.tmdbId}`, s]));
    return ogeler.flatMap((o) => {
        const s = harita.get(anahtar(o));
        if (!s) return [];
        return [{
            id: s.tmdbId,
            tip: s.tip,
            baslik: s.baslik,
            posterPath: s.posterPath,
            arkaPlanPath: s.backdropPath,
            yil: s.yil,
            puan: 0,
            ozet: "",
            turIds: JSON.parse(s.turIds) as number[],
        }];
    });
}

// ── Kayıt durumları ──────────────────────────────────────────────────────────

export async function kayitDurumu(userId: string, o: Anahtar): Promise<KayitDurumu> {
    const k = await db.kayit.findUnique({
        where: { userId_tmdbId_tip: { userId, tmdbId: o.tmdbId, tip: o.tip } },
        select: { durum: true, puan: true, favori: true },
    });
    return k ?? BOS_KAYIT;
}

// Poster kartlarındaki ✓ / 🔖 işaretleri için: verilen içeriklerin durum haritası
export async function durumHaritasi(userId: string | undefined, kartlar: { id: number; tip: IcerikTipi }[]) {
    const harita: Record<string, KayitDurumu["durum"]> = {};
    if (!userId || kartlar.length === 0) return harita;
    const kayitlar = await db.kayit.findMany({
        where: { userId, durum: { not: null }, OR: kartlar.map((k) => ({ tmdbId: k.id, tip: k.tip })) },
        select: { tmdbId: true, tip: true, durum: true },
    });
    for (const k of kayitlar) harita[`${k.tip}-${k.tmdbId}`] = k.durum;
    return harita;
}

// ── Bölümler ─────────────────────────────────────────────────────────────────

export async function izlenenBolumler(userId: string, diziId: number) {
    const satirlar = await db.bolumKaydi.findMany({ where: { userId, diziId }, select: { sezon: true, bolum: true } });
    return satirlar.map((b) => `${b.sezon}-${b.bolum}`);
}

const bugun = () => new Date().toISOString().slice(0, 10);

// Dizinin yayınlanmış (özel bölümler hariç) bölümleri, sezon sırasıyla: [sezon, bolum][]
// Önceki sezonlar tamamen yayınlanmış sayılır; yalnız son sezonun tarihleri kontrol edilir.
export async function yayinlanmisBolumler(diziId: number): Promise<[number, number][]> {
    const d = await diziDetay(diziId);
    if (!d) return [];
    const sezonlar = d.sezonlar.filter((s) => s.no > 0);
    const son = sezonlar.at(-1);
    const sonDetay = son ? await sezonDetay(diziId, son.no) : null;
    const liste: [number, number][] = [];
    for (const s of sezonlar) {
        if (s === son && sonDetay) {
            for (const b of sonDetay.bolumler) if (b.tarih && b.tarih <= bugun()) liste.push([s.no, b.no]);
        } else {
            for (let b = 1; b <= s.bolumSayisi; b++) liste.push([s.no, b]);
        }
    }
    return liste;
}

// "Kaldığın yerden devam et": izliyor durumundaki diziler ve sıradaki izlenmemiş bölüm
export async function devamEdilenler(userId: string, sinir = 12) {
    const kayitlar = await db.kayit.findMany({
        where: { userId, tip: "dizi", durum: "izliyor" },
        orderBy: { updatedAt: "desc" },
        take: sinir,
        select: { tmdbId: true },
    });
    const sonuc = await Promise.all(
        kayitlar.map(async ({ tmdbId }) => {
            const [kart] = await kartlariGetir([{ tmdbId, tip: "dizi" }]);
            const [yayinda, izlenen] = await Promise.all([yayinlanmisBolumler(tmdbId), izlenenBolumler(userId, tmdbId)]);
            const izlenenSet = new Set(izlenen);
            const siradaki = yayinda.find(([s, b]) => !izlenenSet.has(`${s}-${b}`)) ?? null;
            return kart ? { kart, siradaki, izlenen: izlenenSet.size, toplam: yayinda.length } : null;
        }),
    );
    return sonuc.filter((x): x is NonNullable<typeof x> => !!x);
}

// Detay sayfasındaki "listeye ekle" menüsü: kullanıcının listeleri ve bu içerik içlerinde mi
export async function icerikListeleri(userId: string, o: Anahtar) {
    const listeler = await db.liste.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        select: { id: true, ad: true, ogeler: { where: { tmdbId: o.tmdbId, tip: o.tip }, select: { id: true } } },
    });
    return listeler.map((l) => ({ id: l.id, ad: l.ad, var: l.ogeler.length > 0 }));
}

// ── Kütüphane (Listelerim) ───────────────────────────────────────────────────

export const OZEL_LISTELER = {
    "sonra-izle": { ad: "Sonra izleyeceklerim", aciklama: "İzlemek için kenara ayırdıkların", renk: "from-violet-600 to-indigo-600" },
    izliyorum: { ad: "İzlemeye devam", aciklama: "Bölüm bölüm takip ettiğin diziler", renk: "from-sky-500 to-cyan-600" },
    izlediklerim: { ad: "İzlediklerim", aciklama: "İzlediğin her şey, puanlarınla", renk: "from-emerald-500 to-teal-600" },
    favoriler: { ad: "Favorilerim", aciklama: "En sevdiklerin", renk: "from-rose-500 to-orange-500" },
} as const;
export type OzelListe = keyof typeof OZEL_LISTELER;

function ozelFiltre(slug: OzelListe) {
    switch (slug) {
        case "sonra-izle": return { durum: "izleyecek" as const };
        case "izliyorum": return { durum: "izliyor" as const };
        case "izlediklerim": return { durum: "izledi" as const };
        case "favoriler": return { favori: true };
    }
}

// Özel liste içerikleri; izlediklerimde kart puanı kullanıcının puanı (5 üzerinden)
export async function ozelListeIcerikleri(userId: string, slug: OzelListe, tip?: IcerikTipi) {
    const kayitlar = await db.kayit.findMany({
        where: { userId, ...ozelFiltre(slug), ...(tip && { tip }) },
        orderBy: slug === "izlediklerim" ? [{ izlendiTarih: "desc" }, { updatedAt: "desc" }] : { updatedAt: "desc" },
        take: 500,
        select: { tmdbId: true, tip: true, puan: true },
    });
    const kartlar = await kartlariGetir(kayitlar);
    const puanlar = new Map(kayitlar.map((k) => [anahtar(k), k.puan]));
    return kartlar.map((k) => ({ ...k, puan: slug === "izlediklerim" ? (puanlar.get(`${k.tip}-${k.id}`) ?? 0) / 2 : 0 }));
}

// Listelerim sayfası: özel listeler ve kullanıcı listeleri, her birinden ilk 4 poster ve sayı
export async function kutuphaneOzeti(userId: string) {
    const [ozelSayilar, listeler] = await Promise.all([
        Promise.all(
            (Object.keys(OZEL_LISTELER) as OzelListe[]).map(async (slug) => {
                const where = { userId, ...ozelFiltre(slug) };
                const [sayi, ilk] = await Promise.all([
                    db.kayit.count({ where }),
                    db.kayit.findMany({ where, orderBy: { updatedAt: "desc" }, take: 4, select: { tmdbId: true, tip: true } }),
                ]);
                return { slug, sayi, ilk };
            }),
        ),
        db.liste.findMany({
            where: { userId },
            orderBy: { updatedAt: "desc" },
            select: {
                id: true, ad: true, aciklama: true, gizli: true,
                _count: { select: { ogeler: true } },
                ogeler: { orderBy: { createdAt: "desc" }, take: 4, select: { tmdbId: true, tip: true } },
            },
        }),
    ]);

    const tumu = [...ozelSayilar.flatMap((o) => o.ilk), ...listeler.flatMap((l) => l.ogeler)];
    const kartlar = await kartlariGetir([...new Map(tumu.map((o) => [anahtar(o), o])).values()]);
    const poster = new Map(kartlar.map((k) => [`${k.tip}-${k.id}`, k.posterPath]));
    const posterler = (l: Anahtar[]) => l.map((o) => poster.get(anahtar(o)) ?? null).filter((p): p is string => !!p);

    return {
        ozel: ozelSayilar.map((o) => ({ slug: o.slug, ...OZEL_LISTELER[o.slug], sayi: o.sayi, posterler: posterler(o.ilk) })),
        listeler: listeler.map((l) => ({ id: l.id, ad: l.ad, aciklama: l.aciklama, gizli: l.gizli, sayi: l._count.ogeler, posterler: posterler(l.ogeler) })),
    };
}

// Kullanıcı listesi detayı (sahibi değilse yalnız gizli değilse görünür)
export async function listeDetayi(listeId: string, izleyenId: string | undefined, tip?: IcerikTipi) {
    const l = await db.liste.findUnique({
        where: { id: listeId },
        select: {
            id: true, ad: true, aciklama: true, gizli: true, userId: true, updatedAt: true,
            user: { select: { name: true, username: true, image: true } },
            ogeler: { where: tip ? { tip } : undefined, orderBy: { createdAt: "desc" }, select: { tmdbId: true, tip: true } },
        },
    });
    if (!l || (l.gizli && l.userId !== izleyenId)) return null;
    return { ...l, sahibi: l.userId === izleyenId, kartlar: await kartlariGetir(l.ogeler) };
}
