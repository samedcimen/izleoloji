"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const SECENEKLER = [
    { deger: "light", ad: "Açık", ikon: Sun },
    { deger: "dark", ad: "Koyu", ikon: Moon },
    { deger: "system", ad: "Sistem", ikon: Monitor },
] as const;

// Sunucuda seçili tema bilinmez; tarayıcıda yüklenene kadar hiçbir seçenek işaretlenmez
const useYuklendi = () => useSyncExternalStore(() => () => {}, () => true, () => false);

export function TemaSecici({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme();
    const hazir = useYuklendi();

    return (
        <div role="radiogroup" aria-label="Tema" className={cn("grid grid-cols-3 gap-1 rounded-xl bg-foreground/5 p-1", className)}>
            {SECENEKLER.map((s) => {
                const secili = hazir && theme === s.deger;
                return (
                    <button
                        key={s.deger}
                        type="button"
                        role="radio"
                        aria-checked={secili}
                        onClick={() => setTheme(s.deger)}
                        className={cn(
                            "flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition",
                            secili ? "bg-background text-foreground shadow-sm ring-1 ring-foreground/10" : "text-foreground/50 hover:text-foreground",
                        )}
                    >
                        <s.ikon className="size-3.5" />
                        {s.ad}
                    </button>
                );
            })}
        </div>
    );
}
