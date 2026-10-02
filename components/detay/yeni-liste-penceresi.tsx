"use client";

import { useState, useTransition } from "react";
import { Lock, LoaderCircle } from "lucide-react";
import { listeOlustur } from "@/app/actions/liste";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

// Yeni liste oluşturma penceresi (detay sayfası ve Listelerim sayfası kullanır)
export function YeniListePenceresi({ acik, kapat, olusturuldu, aciklama }: {
    acik: boolean;
    kapat: () => void;
    olusturuldu?: (liste: { id: string; ad: string }) => void;
    aciklama?: string;
}) {
    const [ad, setAd] = useState("");
    const [gizli, setGizli] = useState(false);
    const [hata, setHata] = useState<string | null>(null);
    const [bekliyor, baslat] = useTransition();

    const gonder = (e: React.FormEvent) => {
        e.preventDefault();
        baslat(async () => {
            const r = await listeOlustur({ ad, gizli });
            if (r.hata !== undefined) return setHata(r.hata);
            olusturuldu?.(r.liste);
            setAd("");
            setGizli(false);
            setHata(null);
            kapat();
        });
    };

    return (
        <Dialog open={acik} onOpenChange={(a) => !a && kapat()}>
            <DialogContent className="sm:max-w-sm">
                <DialogTitle>Yeni liste</DialogTitle>
                {aciklama && <DialogDescription>{aciklama}</DialogDescription>}
                <form onSubmit={gonder} className="space-y-4">
                    <input
                        autoFocus
                        value={ad}
                        onChange={(e) => setAd(e.target.value)}
                        maxLength={60}
                        placeholder="Örn. Hafta sonu filmleri"
                        aria-label="Liste adı"
                        className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm outline-none focus:border-violet-400 focus:ring-3 focus:ring-violet-400/20"
                    />
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground/75">
                        <input type="checkbox" checked={gizli} onChange={(e) => setGizli(e.target.checked)} className="size-4 accent-violet-500" />
                        <Lock className="size-3.5" />
                        Gizli liste (yalnız sen görürsün)
                    </label>
                    {hata && <p role="alert" className="text-sm text-red-300">{hata}</p>}
                    <button
                        type="submit"
                        disabled={bekliyor || !ad.trim()}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-linear-to-br from-violet-700 to-violet-500 font-bold text-white transition hover:brightness-110 disabled:opacity-50"
                    >
                        {bekliyor && <LoaderCircle className="size-4 animate-spin" />}
                        Oluştur
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
