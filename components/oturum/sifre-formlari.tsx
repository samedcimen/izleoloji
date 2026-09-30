"use client";

import { useActionState } from "react";
import { sifreSifirlamaIste, sifreYenile } from "@/app/actions/oturum";
import { Alan, FormMesaji, GonderButonu, SifreAlani } from "./form-parcalari";

export function SifirlamaIstekFormu() {
    const [durum, eylem] = useActionState(sifreSifirlamaIste, undefined);

    if (durum?.basarili) return <FormMesaji mesaj={durum.mesaj} basarili />;

    return (
        <form action={eylem} className="space-y-4" noValidate>
            <FormMesaji mesaj={durum?.mesaj} />
            <Alan
                ad="email"
                etiket="E-posta"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="ornek@mail.com"
                required
                defaultValue={durum?.degerler?.email}
                hatalar={durum?.hatalar?.email}
            />
            <div className="pt-2">
                <GonderButonu>Sıfırlama bağlantısı gönder</GonderButonu>
            </div>
        </form>
    );
}

export function YeniSifreFormu({ token }: { token: string }) {
    const [durum, eylem] = useActionState(sifreYenile, undefined);

    return (
        <form action={eylem} className="space-y-4" noValidate>
            <input type="hidden" name="token" value={token} />
            <FormMesaji mesaj={durum?.mesaj} />
            <SifreAlani ad="sifre" etiket="Yeni şifre" autoComplete="new-password" required hatalar={durum?.hatalar?.sifre} />
            <SifreAlani ad="tekrar" etiket="Yeni şifre (tekrar)" autoComplete="new-password" required hatalar={durum?.hatalar?.tekrar} />
            <div className="pt-2">
                <GonderButonu>Şifremi değiştir</GonderButonu>
            </div>
        </form>
    );
}
