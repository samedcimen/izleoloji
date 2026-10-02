"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { YeniListePenceresi } from "@/components/detay/yeni-liste-penceresi";

// Listelerim sayfasındaki "yeni liste" kartı; oluşturunca listenin sayfasına gider
export function YeniListeButonu() {
    const router = useRouter();
    const [acik, setAcik] = useState(false);
    return (
        <>
            <button type="button" onClick={() => setAcik(true)} className="group block text-left">
                <div className="grid aspect-[4/3] place-items-center rounded-2xl border-2 border-dashed border-white/15 transition group-hover:border-violet-400/60 group-hover:bg-violet-500/5">
                    <span className="grid size-14 place-items-center rounded-full bg-white/5 text-white/60 transition group-hover:bg-violet-500/20 group-hover:text-violet-200">
                        <Plus className="size-7" />
                    </span>
                </div>
                <p className="mt-3 font-bold transition group-hover:text-violet-300">Yeni liste</p>
                <p className="text-sm text-foreground/50">İstediğin gibi grupla</p>
            </button>
            <YeniListePenceresi acik={acik} kapat={() => setAcik(false)} olusturuldu={(l) => router.push(`/listelerim/${l.id}`)} />
        </>
    );
}
