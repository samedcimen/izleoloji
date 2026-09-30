import { z } from "zod";
import { KULLANICI_ADI_REGEX, UYELIK, YASAKLI_KULLANICI_ADLARI } from "@/lib/ayarlar/uyelik";

// Formlar ve server action'lar için ortak şemalar. Tarayıcıda da kullanılabilir.

export const emailSema = z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Geçerli bir e-posta adresi gir."));

export const sifreSema = z
    .string()
    .min(UYELIK.SIFRE_MIN, `Şifre en az ${UYELIK.SIFRE_MIN} karakter olmalı.`)
    .max(UYELIK.SIFRE_MAX, `Şifre en fazla ${UYELIK.SIFRE_MAX} karakter olabilir.`)
    .refine((s) => /[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(s) && /\d/.test(s), "Şifre en az bir harf ve bir rakam içermeli.");

export const kullaniciAdiSema = z
    .string()
    .trim()
    .toLowerCase()
    .regex(
        KULLANICI_ADI_REGEX,
        `${UYELIK.KULLANICI_ADI_MIN}-${UYELIK.KULLANICI_ADI_MAX} karakter; yalnızca küçük harf, rakam ve alt çizgi.`,
    )
    .refine((a) => !YASAKLI_KULLANICI_ADLARI.has(a), "Bu kullanıcı adı kullanılamaz.");

export const kayitSema = z.object({
    ad: z
        .string()
        .trim()
        .min(UYELIK.AD_MIN, `Ad en az ${UYELIK.AD_MIN} karakter olmalı.`)
        .max(UYELIK.AD_MAX, `Ad en fazla ${UYELIK.AD_MAX} karakter olabilir.`),
    kullaniciAdi: kullaniciAdiSema,
    email: emailSema,
    sifre: sifreSema,
});

export const girisSema = z.object({
    email: emailSema,
    // Girişte kural kontrolü yok (eski şifreler kurala uymayabilir), yalnızca üst sınır
    sifre: z.string().min(1, "Şifreni gir.").max(UYELIK.SIFRE_MAX),
});

export const sifirlamaIstekSema = z.object({ email: emailSema });

export const yeniSifreSema = z
    .object({ token: z.string().regex(/^[a-f0-9]{64}$/), sifre: sifreSema, tekrar: z.string() })
    .refine((v) => v.sifre === v.tekrar, { message: "Şifreler eşleşmiyor.", path: ["tekrar"] });

// Form durumu: alan bazlı hatalar + genel mesaj
export type FormDurumu = {
    hatalar?: Record<string, string[] | undefined>;
    mesaj?: string;
    basarili?: boolean;
    degerler?: Record<string, string>;
};

export function alanHatalari(hata: z.ZodError): FormDurumu["hatalar"] {
    return z.flattenError(hata).fieldErrors as FormDurumu["hatalar"];
}
