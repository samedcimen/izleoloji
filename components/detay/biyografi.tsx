"use client";

import { useState } from "react";

// Uzun biyografiler kısaltılmış gösterilir, "devamını oku" ile açılır
export function Biyografi({ metin }: { metin: string }) {
    const [acik, setAcik] = useState(false);
    const uzun = metin.length > 600;
    return (
        <div>
            <p className={`whitespace-pre-line leading-relaxed text-foreground/75 ${uzun && !acik ? "line-clamp-6" : ""}`}>{metin}</p>
            {uzun && (
                <button type="button" onClick={() => setAcik((a) => !a)} className="mt-2 text-sm font-semibold text-violet-300 transition hover:text-violet-200">
                    {acik ? "Daha az göster" : "Devamını oku"}
                </button>
            )}
        </div>
    );
}
