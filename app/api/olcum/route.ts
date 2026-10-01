import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// GEÇİCİ: Vercel'de bcrypt ve tek Turso sorgusunun süresini ölçer. Ölçümden sonra silinecek.
const HASH = "$2b$12$y5NdbuYrAHx54pLOv3tZTOUOxuSVqMc2cKXg3IlLrmpXiTBk3D22u";

export async function GET() {
    const sure = async (is: () => Promise<unknown>) => {
        const t = performance.now();
        await is();
        return Math.round(performance.now() - t);
    };
    const sorgu1 = await sure(() => db.$queryRaw`SELECT 1`);
    const sorgu2 = await sure(() => db.$queryRaw`SELECT 1`);
    const bcrypt12 = await sure(() => bcrypt.compare("deneme", HASH));
    const bcrypt12b = await sure(() => bcrypt.compare("deneme", HASH));
    const h10 = bcrypt.hashSync("x", 10);
    const bcrypt10 = await sure(() => bcrypt.compare("deneme", h10));
    return Response.json({ bolge: process.env.VERCEL_REGION ?? "yerel", sorgu1, sorgu2, bcrypt12, bcrypt12b, bcrypt10 });
}
