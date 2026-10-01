import "server-only";
import { z } from "zod";

// Sunucu ortam değişkenleri — uygulama açılırken bir kez doğrulanır, eksik/hatalı
// değer varsa hangi değişken olduğu açıkça yazılarak hata verilir.
// Sonraki aşamalarda eklenecek değişkenler (TMDB, auth, SMTP) şimdilik opsiyonel.
const sema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    // Yerelde ve Vercel'de Turso: "libsql://<db>-<org>.turso.io"
    DATABASE_URL: z.string().min(1),
    DATABASE_AUTH_TOKEN: z.string().min(1).optional(),

    // Mail linkleri, sitemap ve OG için tam adres (sonunda / olmadan).
    // Verilmezse Vercel'de projenin canlı adresi, yerelde localhost kullanılır.
    APP_URL: z.url().optional(),
    VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),

    TMDB_API_KEY: z.string().min(1).optional(),

    // Auth.js — AUTH_SECRET'ı Auth.js kendisi okur; burada yalnızca biçim kontrolü.
    // OAuth sağlayıcıları ID + SECRET ikisi de varsa etkinleşir (lib/auth-saglayicilar).
    AUTH_SECRET: z.string().min(32, "en az 32 karakter olmalı (npx auth secret)").optional(),
    AUTH_GOOGLE_ID: z.string().optional(),
    AUTH_GOOGLE_SECRET: z.string().optional(),
    AUTH_GITHUB_ID: z.string().optional(),
    AUTH_GITHUB_SECRET: z.string().optional(),

    // Mail: Resend varsa o, yoksa Gmail SMTP, o da yoksa geliştirmede terminale yazılır
    RESEND_API_KEY: z.string().optional(),
    MAIL_FROM: z.string().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
});

// Panelde boş bırakılan değişkenler "" olarak gelir; hiç tanımlanmamış gibi davran.
const hamDegerler = Object.fromEntries(
    Object.entries(process.env).filter(([, deger]) => deger !== ""),
);

const sonuc = sema.safeParse(hamDegerler);

if (!sonuc.success) {
    const detay = sonuc.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Geçersiz ortam değişkenleri:\n${detay}`);
}

if (sonuc.data.DATABASE_URL.startsWith("libsql://") && !sonuc.data.DATABASE_AUTH_TOKEN) {
    throw new Error("Turso bağlantısı için DATABASE_AUTH_TOKEN gerekli.");
}

const { VERCEL_PROJECT_PRODUCTION_URL, ...veri } = sonuc.data;

export const env = {
    ...veri,
    APP_URL: (
        veri.APP_URL
        ?? (VERCEL_PROJECT_PRODUCTION_URL ? `https://${VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3025")
    ).replace(/\/$/, ""),
};
