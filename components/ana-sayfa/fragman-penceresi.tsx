"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// YouTube fragmanı; iframe yalnızca pencere açıkken yüklenir (sayfa açılışını yavaşlatmasın).
// youtube-nocookie: izleyici açıkça oynatmadıkça çerez bırakmaz.
export function FragmanPenceresi({ baslik, youtubeKey, acik, kapat }: {
    baslik: string;
    youtubeKey: string | null;
    acik: boolean;
    kapat: () => void;
}) {
    return (
        <Dialog open={acik} onOpenChange={(a) => !a && kapat()}>
            <DialogContent overlayClassName="bg-black/85" className="max-w-[min(64rem,calc(100%-2rem))] gap-0 overflow-hidden bg-black p-0 sm:max-w-[min(64rem,calc(100%-2rem))]">
                <DialogTitle className="sr-only">{baslik} — fragman</DialogTitle>
                {acik && youtubeKey && (
                    <iframe
                        src={`https://www.youtube-nocookie.com/embed/${youtubeKey}?autoplay=1&rel=0&modestbranding=1`}
                        title={`${baslik} fragmanı`}
                        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                        className="aspect-video w-full"
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
