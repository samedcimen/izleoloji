"use client";

import { useActionState, useEffect, useState } from "react";
import { Check, LoaderCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { kayitOl, kullaniciAdiMusaitMi } from "@/app/actions/oturum";
import { KULLANICI_ADI_REGEX, UYELIK } from "@/lib/ayarlar/uyelik";
import { Alan, FormMesaji, GonderButonu, SifreAlani } from "./form-parcalari";

type AdDurumu = { tur: "bos" } | { tur: "bakiliyor" } | { tur: "musait" } | { tur: "hata"; mesaj: string };

export function KayitFormu() {
    const [durum, eylem] = useActionState(kayitOl, undefined);
    const [kullaniciAdi, setKullaniciAdi] = useState(durum?.degerler?.kullaniciAdi ?? "");
    // Sunucunun son cevabı, hangi ad için geldiğiyle birlikte (eski cevaplar yeni yazılana uygulanmasın)
    const [cevap, setCevap] = useState<{ ad: string; musait: boolean; mesaj?: string } | null>(null);
    const [sifre, setSifre] = useState("");
    const bicimGecerli = KULLANICI_ADI_REGEX.test(kullaniciAdi);

    // Kullanıcı adı yazılırken 400 ms bekleyip müsaitlik sorulur
    useEffect(() => {
        if (!bicimGecerli) return;
        let iptal = false;
        const zamanlayici = setTimeout(async () => {
            const s = await kullaniciAdiMusaitMi(kullaniciAdi);
            if (!iptal) setCevap({ ad: kullaniciAdi, ...s });
        }, 400);
        return () => {
            iptal = true;
            clearTimeout(zamanlayici);
        };
    }, [kullaniciAdi, bicimGecerli]);

    const adDurumu: AdDurumu =
        !kullaniciAdi ? { tur: "bos" }
        : !bicimGecerli ? { tur: "hata", mesaj: `${UYELIK.KULLANICI_ADI_MIN}-${UYELIK.KULLANICI_ADI_MAX} karakter; küçük harf, rakam ve _` }
        : cevap?.ad !== kullaniciAdi ? { tur: "bakiliyor" }
        : cevap.musait ? { tur: "musait" }
        : { tur: "hata", mesaj: cevap.mesaj ?? "Kullanılamaz." };

    const kurallar = [
        { tamam: sifre.length >= UYELIK.SIFRE_MIN, metin: `En az ${UYELIK.SIFRE_MIN} karakter` },
        { tamam: /[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(sifre), metin: "Bir harf" },
        { tamam: /\d/.test(sifre), metin: "Bir rakam" },
    ];

    return (
        <form action={eylem} className="space-y-4" noValidate>
            <FormMesaji mesaj={durum?.mesaj} />
            <Alan
                ad="ad"
                etiket="Adın"
                autoComplete="name"
                placeholder="Adın ve soyadın"
                required
                defaultValue={durum?.degerler?.ad}
                hatalar={durum?.hatalar?.ad}
            />
            <Alan
                ad="kullaniciAdi"
                etiket="Kullanıcı adı"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="ornek_kullanici"
                required
                value={kullaniciAdi}
                onChange={(e) => setKullaniciAdi(e.target.value.toLocaleLowerCase("tr-TR").replace(/\s/g, "_"))}
                hatalar={durum?.hatalar?.kullaniciAdi}
                ipucu={<KullaniciAdiIpucu durum={adDurumu} ad={kullaniciAdi} />}
            />
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
                autoComplete="new-password"
                required
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
                hatalar={durum?.hatalar?.sifre}
                ipucu={
                    <ul className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5 text-xs">
                        {kurallar.map((k) => (
                            <li key={k.metin} className={cn("flex items-center gap-1 transition", k.tamam ? "text-emerald-300" : "text-white/40")}>
                                <Check className="size-3" />
                                {k.metin}
                            </li>
                        ))}
                    </ul>
                }
            />
            <div className="pt-2">
                <GonderButonu>Hesap oluştur</GonderButonu>
            </div>
        </form>
    );
}

function KullaniciAdiIpucu({ durum, ad }: { durum: AdDurumu; ad: string }) {
    const sinif = "flex items-center gap-1.5 text-xs";
    switch (durum.tur) {
        case "bakiliyor":
            return <p className={cn(sinif, "text-white/45")}><LoaderCircle className="size-3.5 animate-spin" />Kontrol ediliyor…</p>;
        case "musait":
            return <p className={cn(sinif, "text-emerald-300")}><Check className="size-3.5" />@{ad} müsait</p>;
        case "hata":
            return <p className={cn(sinif, "text-amber-300")}><X className="size-3.5" />{durum.mesaj}</p>;
        default:
            return <p className={cn(sinif, "text-white/40")}>Profil adresin olur, sonradan değiştirmek sınırlı.</p>;
    }
}
