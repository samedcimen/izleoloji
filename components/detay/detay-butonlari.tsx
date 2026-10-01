"use client";

import { useState } from "react";
import { Bookmark, Check, Play, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { FragmanPenceresi } from "@/components/ana-sayfa/fragman-penceresi";

// Detay sayfasının üstündeki aksiyonlar. İzleme kaydı ve listeler bir sonraki aşamada
// çalışır hale gelecek; şimdilik basınca kısa bir "yakında" notu gösterir.
export function DetayButonlari({ baslik, fragmanKey }: { baslik: string; fragmanKey: string | null }) {
    const [fragman, setFragman] = useState(false);
    const [not, setNot] = useState<string | null>(null);

    const yakinda = (ne: string) => {
        setNot(`${ne} çok yakında geliyor.`);
        setTimeout(() => setNot(null), 2500);
    };

    const ikincil = "flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-[0.98]";

    return (
        <div className="relative">
            <div className="flex flex-wrap gap-3">
                {fragmanKey && (
                    <button
                        type="button"
                        onClick={() => setFragman(true)}
                        className="flex h-12 items-center gap-2 rounded-full bg-white px-6 font-bold text-black transition hover:bg-white/85 active:scale-[0.98]"
                    >
                        <Play className="size-5 fill-current" />
                        Fragmanı izle
                    </button>
                )}
                <button type="button" onClick={() => yakinda("İzleme kaydı")} className={ikincil}>
                    <Check className="size-5" />
                    İzledim
                </button>
                <button type="button" onClick={() => yakinda("İzleme listesi")} className={ikincil}>
                    <Bookmark className="size-5" />
                    İzleyeceğim
                </button>
                <button type="button" onClick={() => yakinda("Listeler")} aria-label="Listeye ekle" title="Listeye ekle" className={cn(ikincil, "w-12 justify-center px-0")}>
                    <Plus className="size-5" />
                </button>
            </div>
            <p role="status" className={cn("absolute left-0 top-full mt-3 text-sm text-violet-200 transition-opacity", not ? "opacity-100" : "opacity-0")}>
                {not}
            </p>
            {fragmanKey && <FragmanPenceresi baslik={baslik} youtubeKey={fragmanKey} acik={fragman} kapat={() => setFragman(false)} />}
        </div>
    );
}
