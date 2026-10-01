"use server";

import { sezonDetay } from "@/lib/tmdb/detay";

// Dizi sayfasında sezon seçilince bölümleri getirir (TMDB, 12 saat önbellek)
export async function sezonGetir(diziId: number, sezonNo: number) {
    if (!Number.isInteger(diziId) || !Number.isInteger(sezonNo) || diziId <= 0 || sezonNo < 0) return null;
    return sezonDetay(diziId, sezonNo);
}
