"use server";

import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { UYELIK } from "@/lib/ayarlar/uyelik";
import { aramaMetniOlustur } from "@/lib/metin";
import { rastgeleAvatar } from "@/lib/kullanici";
import { mailGonder, mailHazirMi, sifreSifirlamaMaili } from "@/lib/mail";
import { istemciIp, limitAsildiMi } from "@/lib/rate-limit";
import {
    alanHatalari,
    girisSema,
    kayitSema,
    kullaniciAdiSema,
    sifirlamaIstekSema,
    yeniSifreSema,
    type FormDurumu,
} from "@/lib/dogrulama";

const COK_ISTEK = "Çok fazla deneme yaptın. Biraz bekleyip tekrar dene.";

// Açık yönlendirme olmasın: yalnızca site içi göreli yollar kabul edilir
function guvenliYol(yol: FormDataEntryValue | null) {
    return typeof yol === "string" && yol.startsWith("/") && !yol.startsWith("//") && !yol.startsWith("/\\") ? yol : "/";
}

const tokenOzeti = (token: string) => createHash("sha256").update(token).digest("hex");

function formDegerleri(form: FormData, ...alanlar: string[]) {
    return Object.fromEntries(alanlar.map((a) => [a, String(form.get(a) ?? "")]));
}

// ── Giriş ────────────────────────────────────────────────────────────────────

export async function girisYap(_: FormDurumu | undefined, form: FormData): Promise<FormDurumu> {
    const degerler = formDegerleri(form, "email");
    if (await limitAsildiMi("girisIp", await istemciIp())) return { mesaj: COK_ISTEK, degerler };

    const ayik = girisSema.safeParse({ email: form.get("email"), sifre: form.get("sifre") });
    if (!ayik.success) return { hatalar: alanHatalari(ayik.error), degerler };

    try {
        await signIn("credentials", { ...ayik.data, redirectTo: guvenliYol(form.get("geri")) });
    } catch (hata) {
        // Başarılı girişte signIn yönlendirme hatası fırlatır; onu yeniden fırlatmak gerekir
        if (hata instanceof AuthError) {
            return {
                mesaj: `E-posta ya da şifre hatalı. Art arda ${UYELIK.MAX_GIRIS_DENEMESI} hatalı denemede hesap ${UYELIK.HESAP_KILIT_DAKIKA} dakika kilitlenir.`,
                degerler,
            };
        }
        throw hata;
    }
    return {};
}

export async function oauthIleGiris(saglayici: string, geri: string) {
    await signIn(saglayici, { redirectTo: guvenliYol(geri) });
}

export async function cikisYap() {
    await signOut({ redirectTo: "/" });
}

// ── Kayıt ────────────────────────────────────────────────────────────────────

export async function kayitOl(_: FormDurumu | undefined, form: FormData): Promise<FormDurumu> {
    const degerler = formDegerleri(form, "ad", "kullaniciAdi", "email");
    const ayik = kayitSema.safeParse(Object.fromEntries(form));
    if (!ayik.success) return { hatalar: alanHatalari(ayik.error), degerler };

    // Yalnızca geçerli formlar sayılır; yazım hatası yapan kullanıcı kilitlenmesin
    if (await limitAsildiMi("kayitIp", await istemciIp())) return { mesaj: COK_ISTEK, degerler };
    const { ad, kullaniciAdi, email, sifre } = ayik.data;

    const [emailVar, adVar] = await Promise.all([
        db.user.findUnique({ where: { email }, select: { id: true } }),
        db.user.findUnique({ where: { username: kullaniciAdi }, select: { id: true } }),
    ]);
    if (emailVar || adVar) {
        return {
            hatalar: {
                email: emailVar ? ["Bu e-posta ile zaten bir hesap var. Giriş yapmayı ya da şifreni sıfırlamayı dene."] : undefined,
                kullaniciAdi: adVar ? ["Bu kullanıcı adı alınmış."] : undefined,
            },
            degerler,
        };
    }

    try {
        await db.user.create({
            data: {
                name: ad,
                username: kullaniciAdi,
                email,
                password: await bcrypt.hash(sifre, UYELIK.BCRYPT_TUR),
                image: rastgeleAvatar(),
                aramaMetni: aramaMetniOlustur(ad, kullaniciAdi),
            },
        });
    } catch {
        // Aynı anda iki kayıt: benzersizlik kısıtı yakaladı
        return { mesaj: "Bu e-posta ya da kullanıcı adı az önce alındı. Başka bir tane dene.", degerler };
    }

    // Kayıttan sonra doğrudan giriş yapılmış olarak ana sayfaya
    await signIn("credentials", { email, sifre, redirectTo: "/" });
    return {};
}

export async function kullaniciAdiMusaitMi(ad: string): Promise<{ musait: boolean; mesaj?: string }> {
    if (await limitAsildiMi("kullaniciAdiKontrolIp", await istemciIp())) return { musait: false, mesaj: COK_ISTEK };

    const ayik = kullaniciAdiSema.safeParse(ad);
    if (!ayik.success) return { musait: false, mesaj: ayik.error.issues[0]?.message };

    const var_ = await db.user.findUnique({ where: { username: ayik.data }, select: { id: true } });
    return var_ ? { musait: false, mesaj: "Bu kullanıcı adı alınmış." } : { musait: true };
}

// ── Şifre sıfırlama ──────────────────────────────────────────────────────────

const SIFIRLAMA_YANITI: FormDurumu = {
    basarili: true,
    mesaj: "Bu e-postayla kayıtlı bir hesap varsa şifre sıfırlama bağlantısı gönderdik. Gelen kutunu (ve spam klasörünü) kontrol et.",
};

export async function sifreSifirlamaIste(_: FormDurumu | undefined, form: FormData): Promise<FormDurumu> {
    const degerler = formDegerleri(form, "email");
    const ayik = sifirlamaIstekSema.safeParse({ email: form.get("email") });
    if (!ayik.success) return { hatalar: alanHatalari(ayik.error), degerler };
    const { email } = ayik.data;

    const [ipAsti, emailAsti] = await Promise.all([
        limitAsildiMi("sifirlamaIp", await istemciIp()),
        // Sayaç anahtarında e-postanın kendisi değil özeti tutulur
        limitAsildiMi("sifirlamaEmail", tokenOzeti(email)),
    ]);
    if (ipAsti || emailAsti) return { mesaj: COK_ISTEK, degerler };

    // Yapılandırma eksikse hesaba bakmadan söyle; aksi halde yalnızca kayıtlı e-postalar hata alır
    if (!mailHazirMi()) return { mesaj: "Şifre sıfırlama şu an kullanılamıyor. Daha sonra tekrar dene.", degerler };

    // Hesap olsun olmasın aynı yanıt: "bu e-posta kayıtlı mı" anlaşılmasın
    const kullanici = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (!kullanici) return SIFIRLAMA_YANITI;

    const token = randomBytes(32).toString("hex");
    await db.$transaction([
        db.passwordResetToken.deleteMany({ where: { email } }),
        db.passwordResetToken.create({
            data: { email, tokenHash: tokenOzeti(token), expires: new Date(Date.now() + UYELIK.SIFIRLAMA_DAKIKA * 60_000) },
        }),
    ]);

    try {
        await mailGonder({ kime: email, ...sifreSifirlamaMaili(`${env.APP_URL}/sifre-sifirla/${token}`, UYELIK.SIFIRLAMA_DAKIKA) });
    } catch (hata) {
        // Hata kullanıcıya yansıtılmaz: yansıtılırsa yalnızca kayıtlı e-postalar hata görür
        console.error("Şifre sıfırlama maili gönderilemedi:", hata);
    }
    return SIFIRLAMA_YANITI;
}

export async function sifirlamaTokeniGecerliMi(token: string) {
    if (!/^[a-f0-9]{64}$/.test(token)) return false;
    const kayit = await db.passwordResetToken.findUnique({ where: { tokenHash: tokenOzeti(token) }, select: { expires: true } });
    return !!kayit && kayit.expires > new Date();
}

export async function sifreYenile(_: FormDurumu | undefined, form: FormData): Promise<FormDurumu> {
    const ayik = yeniSifreSema.safeParse(Object.fromEntries(form));
    if (!ayik.success) return { hatalar: alanHatalari(ayik.error) };
    const { token, sifre } = ayik.data;

    const kayit = await db.passwordResetToken.findUnique({ where: { tokenHash: tokenOzeti(token) } });
    if (!kayit || kayit.expires < new Date()) {
        return { mesaj: "Bu bağlantının süresi dolmuş ya da daha önce kullanılmış. Yeni bir sıfırlama bağlantısı iste." };
    }

    // Şifre değişir, hesap kilidi açılır, o e-postanın tüm sıfırlama bağlantıları geçersiz olur
    await db.$transaction([
        db.user.update({
            where: { email: kayit.email },
            data: { password: await bcrypt.hash(sifre, UYELIK.BCRYPT_TUR), loginAttempts: 0, loginLockedUntil: null },
        }),
        db.passwordResetToken.deleteMany({ where: { email: kayit.email } }),
    ]);

    redirect("/giris?durum=sifre-yenilendi");
}
