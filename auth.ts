import NextAuth, { CredentialsSignin } from "next-auth";
import { after } from "next/server";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { girisSema } from "@/lib/dogrulama";
import { UYELIK } from "@/lib/ayarlar/uyelik";
import { aramaMetniOlustur } from "@/lib/metin";
import { kullaniciAdiUret, rastgeleAvatar } from "@/lib/kullanici";
import { limitAsildiMi } from "@/lib/rate-limit";

// Girişte IP başına deneme sınırı aşıldı; action bunu kodundan tanıyıp ayrı mesaj gösterir
export class CokFazlaDeneme extends CredentialsSignin {
    code = "cok_fazla_deneme";
}

// Kullanıcı yokken de bcrypt karşılaştırması yapılır ki yanıt süresinden
// "bu e-posta kayıtlı mı" anlaşılamasın.
const SAHTE_HASH = "$2b$10$TbOcPMS2MWUHfD3BuMqgOeX.DGbFKVvB2q6doU01QSfZH8AsLWb5W"; // UYELIK.BCRYPT_TUR ile aynı tur sayısında olmalı

// Oturumdaki kullanıcı en fazla bu aralıkla veritabanından tazelenir (silinmiş/değişmiş hesap)
const TAZELEME_MS = 5 * 60 * 1000;

const saglayicilar: Provider[] = [
    Credentials({
        credentials: { email: {}, sifre: {} },
        async authorize(girdi, istek) {
            const ayik = girisSema.safeParse(girdi);
            if (!ayik.success) return null;
            const { email, sifre } = ayik.data;

            // Sınır kontrolü ve kullanıcı sorgusu aynı anda (art arda iki veritabanı gidiş-dönüşü yerine bir)
            const ip = istek.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || istek.headers.get("x-real-ip") || "bilinmiyor";
            const [sinirAsildi, kullanici] = await Promise.all([
                limitAsildiMi("girisIp", ip),
                db.user.findUnique({ where: { email } }),
            ]);
            if (sinirAsildi) throw new CokFazlaDeneme();

            if (!kullanici?.password) {
                await bcrypt.compare(sifre, SAHTE_HASH);
                return null;
            }
            if (kullanici.loginLockedUntil && kullanici.loginLockedUntil > new Date()) {
                return null;
            }

            if (!(await bcrypt.compare(sifre, kullanici.password))) {
                const deneme = kullanici.loginAttempts + 1;
                const kilitle = deneme >= UYELIK.MAX_GIRIS_DENEMESI;
                await db.user.update({
                    where: { id: kullanici.id },
                    data: kilitle
                        ? { loginAttempts: 0, loginLockedUntil: new Date(Date.now() + UYELIK.HESAP_KILIT_DAKIKA * 60_000) }
                        : { loginAttempts: deneme },
                });
                return null;
            }

            // Deneme sayacını sıfırlama ve eski tur sayısıyla kaydedilmiş şifreyi yenileme
            // yanıtı bekletmesin: yanıt gönderildikten sonra yapılır
            const sayacSifirla = kullanici.loginAttempts > 0 || !!kullanici.loginLockedUntil;
            const yenidenHashle = bcrypt.getRounds(kullanici.password) !== UYELIK.BCRYPT_TUR;
            if (sayacSifirla || yenidenHashle) {
                after(async () => {
                    await db.user.update({
                        where: { id: kullanici.id },
                        data: {
                            ...(sayacSifirla && { loginAttempts: 0, loginLockedUntil: null }),
                            ...(yenidenHashle && { password: await bcrypt.hash(sifre, UYELIK.BCRYPT_TUR) }),
                        },
                    });
                });
            }
            return { id: kullanici.id, name: kullanici.name, email: kullanici.email, image: kullanici.image, username: kullanici.username };
        },
    }),
];

// OAuth sağlayıcıları yalnızca anahtarları tanımlıysa görünür. Google ve GitHub e-postaları
// doğrulanmış olduğundan aynı e-postalı mevcut hesaba bağlanmasına izin verilir.
if (env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET) {
    saglayicilar.push(Google({ allowDangerousEmailAccountLinking: true }));
}
if (env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET) {
    saglayicilar.push(GitHub({ allowDangerousEmailAccountLinking: true }));
}

export const oauthSaglayicilari = saglayicilar
    .map((s) => (typeof s === "function" ? s() : s))
    .filter((s) => s.type === "oidc" || s.type === "oauth")
    .map((s) => ({ id: s.id, ad: s.name }));

export const { handlers, auth, signIn, signOut } = NextAuth({
    // Prisma 7'nin üretilen istemcisi adapter'ın beklediği tiple birebir aynı değil; çalışma zamanında uyumlu.
    adapter: PrismaAdapter(db as never),
    // Credentials sağlayıcısı veritabanı oturumu desteklemediği için JWT
    session: { strategy: "jwt", maxAge: UYELIK.OTURUM_GUN * 24 * 60 * 60 },
    trustHost: true,
    providers: saglayicilar,
    pages: { signIn: "/giris", error: "/giris" },
    // Varsayılan "authjs.session-token" adı localhost'taki diğer Auth.js projeleriyle (ör. eski izleoloji)
    // çakışıyor: tarayıcı çerezi port ayırmadan gönderir, başka anahtarla yazılmış çerez açılamaz.
    // Güvenlik seçenekleri (httpOnly, sameSite, secure) Auth.js varsayılanlarından gelir.
    cookies: { sessionToken: { name: "izleoloji.oturum" } },
    // Yanlış şifre olağan bir durum; her seferinde hata yığını basılmasın
    logger: {
        error(hata) {
            if (hata.name === "CredentialsSignin") return;
            // Açılamayan eski/yabancı oturum çerezi: kullanıcı misafir sayılır, yığın basmaya gerek yok
            if (hata.name === "JWTSessionError") return console.warn("[auth] Geçersiz oturum çerezi yok sayıldı.");
            console.error(hata);
        },
    },
    events: {
        // OAuth ile ilk kez gelen kullanıcıya kullanıcı adı, avatar ve arama metni ver
        async createUser({ user }) {
            if (!user.id) return;
            const email = user.email?.toLowerCase();
            const username = await kullaniciAdiUret(user.name ?? email?.split("@")[0] ?? "izleyici");
            await db.user.update({
                where: { id: user.id },
                data: {
                    ...(email && { email }),
                    username,
                    originalImage: user.image ?? null,
                    image: rastgeleAvatar(),
                    aramaMetni: aramaMetniOlustur(user.name, username),
                },
            });
        },
    },
    callbacks: {
        async jwt({ token, user, trigger }) {
            if (user?.id) {
                token.id = user.id;
                // Şifreyle girişte kullanıcı az önce okundu; tekrar sorgulamaya gerek yok.
                // OAuth'ta ilk girişte kullanıcı adı henüz atanmamış olabilir → aşağıda okunur.
                if (user.username) {
                    token.name = user.name;
                    token.picture = user.image;
                    token.username = user.username;
                    token.tazelendi = Date.now();
                    return token;
                }
                token.tazelendi = 0;
            }
            if (!token.id) return token;

            const eski = typeof token.tazelendi === "number" && Date.now() - token.tazelendi < TAZELEME_MS;
            if (eski && trigger !== "update") return token;

            const k = await db.user.findUnique({
                where: { id: token.id as string },
                select: { name: true, username: true, image: true },
            });
            if (!k) return null; // hesap silinmiş → oturum düşer

            token.name = k.name;
            token.picture = k.image;
            token.username = k.username;
            token.tazelendi = Date.now();
            return token;
        },
        session({ session, token }) {
            session.user.id = token.id as string;
            session.user.username = (token.username as string | null) ?? null;
            session.user.image = (token.picture as string | null) ?? null;
            return session;
        },
    },
});
