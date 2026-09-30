import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { proje } from "@/lib/ayarlar/proje";
import s from "./poster-duvari.module.css";

const SLOGAN = [
    { kelime: "keşfet", aciklama: "Sevdiğin film ve dizilerin nerede yayınlandığını bul." },
    { kelime: "takip et", aciklama: "İzlediğin her filmi, sezonu ve bölümü tek yerde kaydet." },
    { kelime: "paylaş", aciklama: "Puanlarını, yorumlarını ve listelerini arkadaşlarınla paylaş." },
];

export function KarsilamaKarti() {
    return (
        <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#0c0a14]/65 p-8 text-center text-white shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9),0_0_0_1px_rgb(167_139_250/0.08)_inset] backdrop-blur-xl sm:p-10">
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                <span className="bg-linear-to-br from-white to-violet-200 bg-clip-text text-transparent">izle</span>
                <span className="bg-linear-to-br from-violet-500 to-fuchsia-400 bg-clip-text text-transparent">oloji</span>
            </h1>

            <div className="mt-6 text-5xl font-black leading-none tracking-tight sm:text-6xl">
                <div className={s.donen}>
                    {SLOGAN.map((o) => (
                        <span key={o.kelime}>
                            {o.kelime}
                            <span className="text-violet-500">.</span>
                        </span>
                    ))}
                </div>
                <span className={s.sabitSlogan}>
                    keşfet<span className="text-violet-500">.</span>
                </span>
            </div>

            <div className="mt-3 min-h-10 text-sm text-white/55">
                <div className={s.donen}>
                    {SLOGAN.map((o) => (
                        <p key={o.kelime}>{o.aciklama}</p>
                    ))}
                </div>
                <p className={s.sabitSlogan}>{proje.aciklama}</p>
            </div>

            <div className="mt-8 flex flex-col gap-3">
                <Link
                    href="/kayit"
                    className="flex h-12 items-center justify-center rounded-full bg-linear-to-br from-violet-700 to-violet-500 font-bold shadow-[0_8px_30px_-6px_rgb(124_58_237/0.7)] transition hover:brightness-110 active:scale-[0.98]"
                >
                    {proje.baslik}&apos;ye ücretsiz katıl
                </Link>
                <Link
                    href="/giris"
                    className="flex h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-semibold text-white/85 transition hover:bg-white/10 active:scale-[0.98]"
                >
                    Giriş yap
                </Link>
                <Link
                    href="/kesfet"
                    className="group mx-auto mt-1 flex items-center gap-1 text-xs text-white/45 transition hover:text-white/80"
                >
                    ya da giriş yapmadan keşfet
                    <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
                </Link>
            </div>
        </div>
    );
}
