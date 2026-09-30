import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OturumKarti } from "@/components/oturum/oturum-karti";
import { OAuthButonlari } from "@/components/oturum/oauth-butonlari";
import { GirisFormu } from "@/components/oturum/giris-formu";

export const metadata: Metadata = { title: "Giriş yap" };

// Auth.js'in ?error= kodları → kullanıcıya gösterilecek mesaj
const HATALAR: Record<string, string> = {
    OAuthAccountNotLinked: "Bu e-posta başka bir giriş yöntemiyle kayıtlı. O yöntemle giriş yap.",
    AccessDenied: "Giriş izni verilmedi.",
    Configuration: "Giriş şu an kullanılamıyor. Birazdan tekrar dene.",
    Verification: "Bağlantının süresi dolmuş ya da daha önce kullanılmış.",
};

const DURUMLAR: Record<string, string> = {
    "sifre-yenilendi": "Şifren değişti. Yeni şifrenle giriş yapabilirsin.",
};

export default async function GirisSayfasi({ searchParams }: PageProps<"/giris">) {
    const { geri, error, durum } = await searchParams;
    const donus = typeof geri === "string" && geri.startsWith("/") && !geri.startsWith("//") ? geri : "/";

    if (await auth()) redirect(donus);

    const bilgi =
        typeof error === "string" ? { mesaj: HATALAR[error] ?? "Giriş yapılamadı. Tekrar dene.", basarili: false }
        : typeof durum === "string" && DURUMLAR[durum] ? { mesaj: DURUMLAR[durum], basarili: true }
        : undefined;

    return (
        <OturumKarti
            baslik="Tekrar hoş geldin"
            aciklama="İzleme geçmişine ve listelerine kaldığın yerden devam et."
            alt={
                <>
                    Hesabın yok mu?{" "}
                    <Link href="/kayit" className="font-semibold text-violet-300 hover:text-violet-200">
                        Ücretsiz kayıt ol
                    </Link>
                </>
            }
        >
            <OAuthButonlari geri={donus} ayracMetni="ya da e-postayla" />
            <GirisFormu geri={donus} bilgi={bilgi} />
        </OturumKarti>
    );
}
