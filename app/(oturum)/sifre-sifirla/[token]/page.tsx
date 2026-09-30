import type { Metadata } from "next";
import Link from "next/link";
import { sifirlamaTokeniGecerliMi } from "@/app/actions/oturum";
import { OturumKarti } from "@/components/oturum/oturum-karti";
import { YeniSifreFormu } from "@/components/oturum/sifre-formlari";

export const metadata: Metadata = { title: "Yeni şifre", robots: { index: false } };

export default async function YeniSifreSayfasi({ params }: PageProps<"/sifre-sifirla/[token]">) {
    const { token } = await params;
    const gecerli = await sifirlamaTokeniGecerliMi(token);

    if (!gecerli) {
        return (
            <OturumKarti
                baslik="Bağlantı geçersiz"
                aciklama="Bu şifre sıfırlama bağlantısının süresi dolmuş ya da daha önce kullanılmış."
            >
                <Link
                    href="/sifre-sifirla"
                    className="flex h-12 w-full items-center justify-center rounded-full bg-linear-to-br from-violet-700 to-violet-500 font-bold text-white transition hover:brightness-110"
                >
                    Yeni bağlantı iste
                </Link>
            </OturumKarti>
        );
    }

    return (
        <OturumKarti baslik="Yeni şifre belirle" aciklama="Şifren değişince tüm cihazlarda yeni şifrenle giriş yaparsın.">
            <YeniSifreFormu token={token} />
        </OturumKarti>
    );
}
