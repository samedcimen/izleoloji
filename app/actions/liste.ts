"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { oturumAl } from "@/lib/oturum";
import { onbellegeYaz } from "@/lib/kutuphane";
import type { IcerikTipi } from "@/lib/tmdb/gorsel";

// Kullanıcı listeleri: oluştur, düzenle, sil, içerik ekle/çıkar. Her işlemde sahiplik kontrol edilir.

const listeSema = z.object({
    ad: z.string().trim().min(1, "Liste adı boş olamaz.").max(60, "Liste adı en fazla 60 karakter."),
    aciklama: z.string().trim().max(300, "Açıklama en fazla 300 karakter.").optional().transform((a) => a || null),
    gizli: z.boolean().optional(),
});

type Sonuc<T = object> = { hata: string } | ({ hata?: undefined } & T);

async function kullaniciId() {
    return (await oturumAl())?.user?.id ?? null;
}

const AYNI_AD = "Bu adda bir listen zaten var.";

export async function listeOlustur(girdi: { ad: string; aciklama?: string; gizli?: boolean }): Promise<Sonuc<{ liste: { id: string; ad: string } }>> {
    const userId = await kullaniciId();
    if (!userId) return { hata: "Giriş yapmalısın." };
    const ayik = listeSema.safeParse(girdi);
    if (!ayik.success) return { hata: ayik.error.issues[0].message };
    try {
        const liste = await db.liste.create({
            data: { userId, ad: ayik.data.ad, aciklama: ayik.data.aciklama, gizli: ayik.data.gizli ?? false },
            select: { id: true, ad: true },
        });
        refresh();
        return { liste };
    } catch {
        return { hata: AYNI_AD };
    }
}

export async function listeGuncelle(listeId: string, girdi: { ad: string; aciklama?: string; gizli?: boolean }): Promise<Sonuc> {
    const userId = await kullaniciId();
    if (!userId) return { hata: "Giriş yapmalısın." };
    const ayik = listeSema.safeParse(girdi);
    if (!ayik.success) return { hata: ayik.error.issues[0].message };
    try {
        const { count } = await db.liste.updateMany({ where: { id: listeId, userId }, data: ayik.data });
        if (!count) return { hata: "Liste bulunamadı." };
    } catch {
        return { hata: AYNI_AD };
    }
    refresh();
    return {};
}

export async function listeSil(listeId: string): Promise<Sonuc> {
    const userId = await kullaniciId();
    if (!userId) return { hata: "Giriş yapmalısın." };
    const { count } = await db.liste.deleteMany({ where: { id: listeId, userId } });
    if (!count) return { hata: "Liste bulunamadı." };
    refresh();
    return {};
}

// ekle: true ekler, false çıkarır
export async function listeOgesiDegistir(listeId: string, tip: IcerikTipi, tmdbId: number, ekle: boolean): Promise<Sonuc> {
    const userId = await kullaniciId();
    if (!userId) return { hata: "Giriş yapmalısın." };
    if ((tip !== "film" && tip !== "dizi") || !Number.isInteger(tmdbId) || tmdbId <= 0) return { hata: "Geçersiz içerik." };

    const liste = await db.liste.findFirst({ where: { id: listeId, userId }, select: { id: true } });
    if (!liste) return { hata: "Liste bulunamadı." };

    if (ekle) {
        await onbellegeYaz({ tmdbId, tip });
        await db.listeOge.upsert({
            where: { listeId_tmdbId_tip: { listeId, tmdbId, tip } },
            create: { listeId, tmdbId, tip },
            update: {},
        });
    } else {
        await db.listeOge.deleteMany({ where: { listeId, tmdbId, tip } });
    }
    // Listenin "son güncellenme" sırası için
    await db.liste.update({ where: { id: listeId }, data: { updatedAt: new Date() } });
    refresh();
    return {};
}
