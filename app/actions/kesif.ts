"use server";

import { turIcerikleri } from "@/lib/tmdb/ana-sayfa";
import { KESIF_TURLERI } from "@/lib/tmdb/turler";

// Ana sayfadaki "türe göre keşfet" seçimi. Yalnızca sabit listedeki türler istenebilir.
export async function turSec(sira: number) {
    const tur = KESIF_TURLERI[sira];
    if (!tur) return [];
    return turIcerikleri(tur.film, tur.dizi);
}
