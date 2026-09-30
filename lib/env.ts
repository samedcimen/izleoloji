import "server-only";
import { z } from "zod";

// Sunucu ortam değişkenleri — uygulama açılırken bir kez doğrulanır, eksik/hatalı
// değer varsa hangi değişken olduğu açıkça yazılarak hata verilir.
// Sonraki aşamalarda eklenecek değişkenler (TMDB, auth, SMTP) şimdilik opsiyonel.
const sema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    // Yerelde "file:./dev.db", üretimde "libsql://<db>-<org>.turso.io"
    DATABASE_URL: z.string().min(1).default("file:./dev.db"),
    DATABASE_AUTH_TOKEN: z.string().min(1).optional(),

    // Mail linkleri, sitemap ve OG için tam adres (sonunda / olmadan)
    APP_URL: z.url().default("http://localhost:3020"),

    TMDB_API_KEY: z.string().min(1).optional(),
});

const sonuc = sema.safeParse(process.env);

if (!sonuc.success) {
    const detay = sonuc.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Geçersiz ortam değişkenleri:\n${detay}`);
}

if (sonuc.data.DATABASE_URL.startsWith("libsql://") && !sonuc.data.DATABASE_AUTH_TOKEN) {
    throw new Error("Turso bağlantısı için DATABASE_AUTH_TOKEN gerekli.");
}

export const env = sonuc.data;
