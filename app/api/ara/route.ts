import { NextResponse, type NextRequest } from "next/server";
import { ARAMA_EN_KISA, ARAMA_EN_UZUN, hizliAra } from "@/lib/arama";

// Arama penceresinin canlı sonuçları (yazdıkça, istemci tarafında gecikmeli çağrılır).
// TMDB yanıtları fetch önbelleğinde 10 dakika tutulur; aynı aramalar TMDB'ye tekrar gitmez.
export async function GET(req: NextRequest) {
    const q = req.nextUrl.searchParams.get("q")?.trim().slice(0, ARAMA_EN_UZUN) ?? "";
    if (q.length < ARAMA_EN_KISA) return NextResponse.json({ icerikler: [], kisiler: [], kullanicilar: [] });
    try {
        return NextResponse.json(await hizliAra(q), { headers: { "Cache-Control": "private, max-age=60" } });
    } catch {
        return NextResponse.json({ hata: "Arama şu an yapılamıyor." }, { status: 502 });
    }
}
