"use server";

import { refresh } from "next/cache";
import { db } from "@/lib/db";
import { oturumAl } from "@/lib/oturum";
import { XP } from "@/lib/seviye";
import { sezonDetay } from "@/lib/tmdb/detay";
import { BOS_KAYIT, izlenenBolumler, onbellegeYaz, yayinlanmisBolumler, type KayitDurumu } from "@/lib/kutuphane";
import type { IcerikTipi } from "@/lib/tmdb/gorsel";
import type { Prisma } from "@/lib/generated/prisma/client";

// İzleme kaydı işlemleri. Her işlem: eski kaydı oku → yeni durumu hesapla → XP farkını bul →
// hepsini tek veritabanı işleminde yaz. Sonra refresh() ile yan menüdeki seviye çubuğu güncellenir.

type Sonuc<T = KayitDurumu> = { hata: "giris" | "gecersiz" } | ({ hata?: undefined } & T);

const gecerli = (tip: unknown, id: unknown): tip is IcerikTipi =>
    (tip === "film" || tip === "dizi") && Number.isInteger(id) && (id as number) > 0;

async function kullaniciId() {
    return (await oturumAl())?.user?.id ?? null;
}

function xpFarki(eski: KayitDurumu, yeni: KayitDurumu) {
    let fark = 0;
    if (yeni.durum === "izledi" && eski.durum !== "izledi") fark += XP.IZLEDI;
    if (eski.durum === "izledi" && yeni.durum !== "izledi") fark -= XP.IZLEDI;
    if (yeni.puan && !eski.puan) fark += XP.PUAN;
    if (!yeni.puan && eski.puan) fark -= XP.PUAN;
    return fark;
}

// Kaydı yazar (boşsa siler) ve XP'yi günceller; tx içinde çağrılır
async function kaydiYaz(tx: Prisma.TransactionClient, userId: string, tip: IcerikTipi, tmdbId: number, eski: KayitDurumu, yeni: KayitDurumu, ekXp = 0) {
    const where = { userId_tmdbId_tip: { userId, tmdbId, tip } };
    const bos = !yeni.durum && !yeni.puan && !yeni.favori;
    if (bos) {
        await tx.kayit.deleteMany({ where: { userId, tmdbId, tip } });
    } else {
        const izlendiTarih = yeni.durum === "izledi" && eski.durum !== "izledi" ? new Date() : undefined;
        const veri = { durum: yeni.durum, puan: yeni.puan, favori: yeni.favori, ...(izlendiTarih && { izlendiTarih }) };
        await tx.kayit.upsert({ where, create: { userId, tmdbId, tip, ...veri }, update: veri });
    }
    const fark = xpFarki(eski, yeni) + ekXp;
    if (fark) await tx.user.update({ where: { id: userId }, data: { xp: { increment: fark } } });
}

async function guncelle(tip: IcerikTipi, tmdbId: number, hesapla: (eski: KayitDurumu) => KayitDurumu): Promise<Sonuc> {
    const userId = await kullaniciId();
    if (!userId) return { hata: "giris" };
    if (!gecerli(tip, tmdbId)) return { hata: "gecersiz" };

    // Listelerde gösterebilmek için başlık/poster önbelleğe (TMDB detay önbelleğinden gelir)
    await onbellegeYaz({ tmdbId, tip });

    const yeni = await db.$transaction(async (tx) => {
        const eski = (await tx.kayit.findUnique({
            where: { userId_tmdbId_tip: { userId, tmdbId, tip } },
            select: { durum: true, puan: true, favori: true },
        })) ?? BOS_KAYIT;
        const yeni = hesapla(eski);
        await kaydiYaz(tx, userId, tip, tmdbId, eski, yeni);
        return yeni;
    });
    refresh();
    return yeni;
}

// "İzledim" / "İzleyeceğim": aynı duruma tekrar basınca kaldırılır
export async function durumDegistir(tip: IcerikTipi, tmdbId: number, durum: "izledi" | "izleyecek") {
    if (durum !== "izledi" && durum !== "izleyecek") return { hata: "gecersiz" } as const;
    return guncelle(tip, tmdbId, (e) => ({ ...e, durum: e.durum === durum ? null : durum }));
}

// Puan 1-10 (yarım yıldız adımları); null kaldırır. Puan verilen içerik "izledim" sayılır.
export async function puanVer(tip: IcerikTipi, tmdbId: number, puan: number | null) {
    if (puan !== null && (!Number.isInteger(puan) || puan < 1 || puan > 10)) return { hata: "gecersiz" } as const;
    return guncelle(tip, tmdbId, (e) => ({ ...e, puan, durum: puan ? "izledi" : e.durum }));
}

export async function favoriDegistir(tip: IcerikTipi, tmdbId: number) {
    return guncelle(tip, tmdbId, (e) => ({ ...e, favori: !e.favori }));
}

// ── Bölüm takibi ─────────────────────────────────────────────────────────────

type BolumSonucu = Sonuc<{ kayit: KayitDurumu; izlenenler: string[] }>;

// Bölümler değişince dizinin durumu: hepsi izlendiyse "izledi", bir kısmıysa "izliyor"
async function bolumleriUygula(diziId: number, eklenecek: [number, number][], silinecek: [number, number][]): Promise<BolumSonucu> {
    const userId = await kullaniciId();
    if (!userId) return { hata: "giris" };
    if (!gecerli("dizi", diziId)) return { hata: "gecersiz" };

    const [yayinda] = await Promise.all([yayinlanmisBolumler(diziId), onbellegeYaz({ tmdbId: diziId, tip: "dizi" })]);

    const kayit = await db.$transaction(async (tx) => {
        let bolumXp = 0;
        for (const [sezon, bolum] of silinecek) {
            const { count } = await tx.bolumKaydi.deleteMany({ where: { userId, diziId, sezon, bolum } });
            bolumXp -= count * XP.BOLUM;
        }
        for (const [sezon, bolum] of eklenecek) {
            const varMi = await tx.bolumKaydi.findUnique({ where: { userId_diziId_sezon_bolum: { userId, diziId, sezon, bolum } }, select: { sezon: true } });
            if (varMi) continue;
            await tx.bolumKaydi.create({ data: { userId, diziId, sezon, bolum } });
            bolumXp += XP.BOLUM;
        }

        const izlenen = new Set((await tx.bolumKaydi.findMany({ where: { userId, diziId }, select: { sezon: true, bolum: true } })).map((b) => `${b.sezon}-${b.bolum}`));
        const hepsi = yayinda.length > 0 && yayinda.every(([s, b]) => izlenen.has(`${s}-${b}`));

        const eski = (await tx.kayit.findUnique({
            where: { userId_tmdbId_tip: { userId, tmdbId: diziId, tip: "dizi" } },
            select: { durum: true, puan: true, favori: true },
        })) ?? BOS_KAYIT;
        const durum: KayitDurumu["durum"] = hepsi ? "izledi" : izlenen.size > 0 ? "izliyor" : eski.durum === "izliyor" ? null : eski.durum;
        const yeni = { ...eski, durum };
        await kaydiYaz(tx, userId, "dizi", diziId, eski, yeni, bolumXp);
        return yeni;
    });

    refresh();
    return { kayit, izlenenler: await izlenenBolumler(userId, diziId) };
}

export async function bolumDegistir(diziId: number, sezon: number, bolum: number) {
    if (![sezon, bolum].every((x) => Number.isInteger(x) && x >= 0)) return { hata: "gecersiz" } as const;
    const userId = await kullaniciId();
    if (!userId) return { hata: "giris" } as const;
    const var_ = await db.bolumKaydi.findUnique({ where: { userId_diziId_sezon_bolum: { userId, diziId, sezon, bolum } }, select: { sezon: true } });
    return var_ ? bolumleriUygula(diziId, [], [[sezon, bolum]]) : bolumleriUygula(diziId, [[sezon, bolum]], []);
}

// Sezonun yayınlanmış tüm bölümlerini işaretler ya da işaretlerini kaldırır
export async function sezonDegistir(diziId: number, sezon: number, izlendi: boolean) {
    if (!Number.isInteger(sezon) || sezon < 0) return { hata: "gecersiz" } as const;
    const s = await sezonDetay(diziId, sezon);
    if (!s) return { hata: "gecersiz" } as const;
    const bugun = new Date().toISOString().slice(0, 10);
    const bolumler = s.bolumler.filter((b) => b.tarih && b.tarih <= bugun).map((b) => [sezon, b.no] as [number, number]);
    return izlendi ? bolumleriUygula(diziId, bolumler, []) : bolumleriUygula(diziId, [], bolumler);
}
