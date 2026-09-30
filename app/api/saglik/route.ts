import { db } from "@/lib/db";

// Veritabanı bağlantısını doğrulamak için basit sağlık kontrolü (Vercel/uptime izleme).
export async function GET() {
    try {
        await db.$queryRaw`SELECT 1`;
        return Response.json({ durum: "ok" });
    } catch {
        return Response.json({ durum: "hata" }, { status: 503 });
    }
}
