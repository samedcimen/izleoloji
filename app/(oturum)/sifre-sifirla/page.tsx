import type { Metadata } from "next";
import Link from "next/link";
import { OturumKarti } from "@/components/oturum/oturum-karti";
import { SifirlamaIstekFormu } from "@/components/oturum/sifre-formlari";

export const metadata: Metadata = { title: "Şifremi unuttum" };

export default function SifreSifirlaSayfasi() {
    return (
        <OturumKarti
            baslik="Şifreni mi unuttun?"
            aciklama="E-posta adresini yaz, şifreni sıfırlaman için bir bağlantı gönderelim."
            alt={
                <Link href="/giris" className="font-semibold text-violet-300 hover:text-violet-200">
                    ← Girişe dön
                </Link>
            }
        >
            <SifirlamaIstekFormu />
        </OturumKarti>
    );
}
