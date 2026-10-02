import Link from "next/link";
import { cn } from "@/lib/utils";

// Tümü / Filmler / Diziler filtresi (adres çubuğunda ?tip=)
export function TipFiltresi({ yol, secili }: { yol: string; secili?: "film" | "dizi" }) {
    const secenekler = [
        { ad: "Tümü", href: yol, aktif: !secili },
        { ad: "Filmler", href: `${yol}?tip=film`, aktif: secili === "film" },
        { ad: "Diziler", href: `${yol}?tip=dizi`, aktif: secili === "dizi" },
    ];
    return (
        <div className="flex gap-2">
            {secenekler.map((s) => (
                <Link
                    key={s.ad}
                    href={s.href}
                    scroll={false}
                    aria-current={s.aktif ? "page" : undefined}
                    className={cn(
                        "rounded-full border px-4 py-1.5 text-sm font-semibold transition",
                        s.aktif ? "border-violet-400/60 bg-violet-500/20 text-white" : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white",
                    )}
                >
                    {s.ad}
                </Link>
            ))}
        </div>
    );
}
