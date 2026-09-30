import Link from "next/link";

// Giriş/kayıt sayfalarının poster duvarı önündeki buzlu cam kartı
export function OturumKarti({ baslik, aciklama, children, alt }: {
    baslik: string;
    aciklama?: React.ReactNode;
    children: React.ReactNode;
    alt?: React.ReactNode;
}) {
    return (
        <div className="relative z-10 w-full max-w-md">
            <div className="rounded-3xl border border-white/10 bg-[#0c0a14]/70 p-7 text-white shadow-[0_30px_80px_-20px_rgb(0_0_0/0.9),0_0_0_1px_rgb(167_139_250/0.08)_inset] backdrop-blur-xl sm:p-9">
                <Link href="/" className="mx-auto mb-6 block w-fit text-3xl font-black tracking-tight">
                    <span className="bg-linear-to-br from-white to-violet-200 bg-clip-text text-transparent">izle</span>
                    <span className="bg-linear-to-br from-violet-500 to-fuchsia-400 bg-clip-text text-transparent">oloji</span>
                </Link>
                <h1 className="text-center text-xl font-bold">{baslik}</h1>
                {aciklama && <p className="mt-1.5 text-center text-sm text-white/55">{aciklama}</p>}
                <div className="mt-7">{children}</div>
            </div>
            {alt && <div className="mt-5 text-center text-sm text-white/60">{alt}</div>}
        </div>
    );
}
