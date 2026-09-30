"use client";

import { useActionState } from "react";
import Link from "next/link";
import { girisYap } from "@/app/actions/oturum";
import { Alan, FormMesaji, GonderButonu, SifreAlani } from "./form-parcalari";

export function GirisFormu({ geri, bilgi }: { geri: string; bilgi?: { mesaj: string; basarili: boolean } }) {
    const [durum, eylem] = useActionState(girisYap, undefined);
    const mesaj = durum?.mesaj ? { mesaj: durum.mesaj, basarili: false } : bilgi;

    return (
        <form action={eylem} className="space-y-4" noValidate>
            <input type="hidden" name="geri" value={geri} />
            <FormMesaji {...mesaj} />
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
            <SifreAlani
                ad="sifre"
                etiket="Şifre"
                autoComplete="current-password"
                required
                hatalar={durum?.hatalar?.sifre}
                sag={
                    <Link href="/sifre-sifirla" className="text-xs text-violet-300 hover:text-violet-200">
                        Şifremi unuttum
                    </Link>
                }
            />
            <div className="pt-2">
                <GonderButonu>Giriş yap</GonderButonu>
            </div>
        </form>
    );
}
