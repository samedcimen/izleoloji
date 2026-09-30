import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OturumKarti } from "@/components/oturum/oturum-karti";
import { OAuthButonlari } from "@/components/oturum/oauth-butonlari";
import { KayitFormu } from "@/components/oturum/kayit-formu";

export const metadata: Metadata = { title: "Kayıt ol" };

export default async function KayitSayfasi() {
    if (await auth()) redirect("/");

    return (
        <OturumKarti
            baslik="Hesap oluştur"
            aciklama="İzlediklerini kaydet, listeler yap, arkadaşlarını takip et."
            alt={
                <>
                    Zaten hesabın var mı?{" "}
                    <Link href="/giris" className="font-semibold text-violet-300 hover:text-violet-200">
                        Giriş yap
                    </Link>
                </>
            }
        >
            <OAuthButonlari geri="/" ayracMetni="ya da e-postayla kayıt ol" />
            <KayitFormu />
            <p className="mt-5 text-center text-xs leading-relaxed text-white/40">
                Kayıt olarak kullanım koşullarını ve gizlilik politikasını kabul etmiş olursun.
            </p>
        </OturumKarti>
    );
}
