"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Lock, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { listeGuncelle, listeSil } from "@/app/actions/liste";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Liste sahibinin menüsü: düzenle (ad, açıklama, gizlilik) ve sil
export function ListeAyarlari({ liste }: { liste: { id: string; ad: string; aciklama: string | null; gizli: boolean } }) {
    const router = useRouter();
    const [duzenle, setDuzenle] = useState(false);
    const [sil, setSil] = useState(false);
    const [ad, setAd] = useState(liste.ad);
    const [aciklama, setAciklama] = useState(liste.aciklama ?? "");
    const [gizli, setGizli] = useState(liste.gizli);
    const [hata, setHata] = useState<string | null>(null);
    const [bekliyor, baslat] = useTransition();

    const kaydet = (e: React.FormEvent) => {
        e.preventDefault();
        baslat(async () => {
            const r = await listeGuncelle(liste.id, { ad, aciklama, gizli });
            if (r.hata !== undefined) return setHata(r.hata);
            setDuzenle(false);
        });
    };

    const silOnayla = () =>
        baslat(async () => {
            const r = await listeSil(liste.id);
            if (r.hata !== undefined) return setHata(r.hata);
            router.push("/listelerim");
        });

    const alan = "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm outline-none focus:border-violet-400 focus:ring-3 focus:ring-violet-400/20";

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger aria-label="Liste ayarları" className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/5 transition hover:bg-white/10">
                    <MoreHorizontal className="size-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} className="w-48">
                    <DropdownMenuItem onClick={() => setDuzenle(true)}><Pencil />Düzenle</DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={() => setSil(true)}><Trash2 />Listeyi sil</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={duzenle} onOpenChange={setDuzenle}>
                <DialogContent className="sm:max-w-sm">
                    <DialogTitle>Listeyi düzenle</DialogTitle>
                    <form onSubmit={kaydet} className="space-y-4">
                        <input value={ad} onChange={(e) => setAd(e.target.value)} maxLength={60} aria-label="Liste adı" className={`${alan} h-11`} />
                        <textarea value={aciklama} onChange={(e) => setAciklama(e.target.value)} maxLength={300} rows={3} placeholder="Açıklama (isteğe bağlı)" aria-label="Açıklama" className={`${alan} resize-none py-2.5`} />
                        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground/75">
                            <input type="checkbox" checked={gizli} onChange={(e) => setGizli(e.target.checked)} className="size-4 accent-violet-500" />
                            <Lock className="size-3.5" /> Gizli liste
                        </label>
                        {hata && <p role="alert" className="text-sm text-red-300">{hata}</p>}
                        <button type="submit" disabled={bekliyor || !ad.trim()} className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-linear-to-br from-violet-700 to-violet-500 font-bold text-white transition hover:brightness-110 disabled:opacity-50">
                            {bekliyor && <LoaderCircle className="size-4 animate-spin" />}Kaydet
                        </button>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={sil} onOpenChange={setSil}>
                <DialogContent className="sm:max-w-sm">
                    <DialogTitle>Liste silinsin mi?</DialogTitle>
                    <DialogDescription>&ldquo;{liste.ad}&rdquo; ve içindeki tüm kayıtlar kalıcı olarak silinir. İzleme kayıtların etkilenmez.</DialogDescription>
                    {hata && <p role="alert" className="text-sm text-red-300">{hata}</p>}
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setSil(false)} className="h-11 flex-1 rounded-full border border-white/15 bg-white/5 font-semibold transition hover:bg-white/10">Vazgeç</button>
                        <button type="button" onClick={silOnayla} disabled={bekliyor} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-red-600 font-bold text-white transition hover:bg-red-500 disabled:opacity-50">
                            {bekliyor && <LoaderCircle className="size-4 animate-spin" />}Sil
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
