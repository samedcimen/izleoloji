"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Yarım yıldızlı 5'lik puan seçici. deger: 1-10 (= ½ … 5 yıldız), null: puan yok.
// Her yıldız iki düğmeden oluşur (sol yarı / sağ yarı); seçili değere tekrar basınca puan kalkar.
export function YildizPuan({ deger, degistir, devreDisi, boyut = "size-7" }: {
    deger: number | null;
    degistir: (yeni: number | null) => void;
    devreDisi?: boolean;
    boyut?: string;
}) {
    const [uzerinde, setUzerinde] = useState<number | null>(null);
    const gosterilen = uzerinde ?? deger ?? 0;

    return (
        <div className="flex items-center" role="radiogroup" aria-label="Puan" onMouseLeave={() => setUzerinde(null)}>
            {[1, 2, 3, 4, 5].map((i) => {
                const dolu = gosterilen >= i * 2 ? 1 : gosterilen === i * 2 - 1 ? 0.5 : 0;
                return (
                    <span key={i} className={cn("relative", boyut)}>
                        <Star className={cn("absolute inset-0 text-white/25", boyut)} strokeWidth={1.5} />
                        <span className="absolute inset-0 overflow-hidden" style={{ width: `${dolu * 100}%` }}>
                            <Star className={cn("fill-amber-400 text-amber-400", boyut, uzerinde !== null && "fill-amber-300 text-amber-300")} strokeWidth={1.5} />
                        </span>
                        {[i * 2 - 1, i * 2].map((v) => (
                            <button
                                key={v}
                                type="button"
                                role="radio"
                                aria-checked={deger === v}
                                aria-label={`${(v / 2).toLocaleString("tr-TR")} yıldız`}
                                disabled={devreDisi}
                                onMouseEnter={() => setUzerinde(v)}
                                onFocus={() => setUzerinde(v)}
                                onBlur={() => setUzerinde(null)}
                                onClick={() => degistir(deger === v ? null : v)}
                                className={cn("absolute inset-y-0 w-1/2 cursor-pointer disabled:cursor-wait", v % 2 ? "left-0" : "right-0")}
                            />
                        ))}
                    </span>
                );
            })}
        </div>
    );
}

export const puanMetni = (p: number | null) => (p ? `${(p / 2).toLocaleString("tr-TR")} / 5` : null);
