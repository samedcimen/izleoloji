import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { oturumAl } from "@/lib/oturum";
import type { IcerikTipi } from "@/lib/tmdb/gorsel";
import { OZEL_LISTELER, durumHaritasi, listeDetayi, ozelListeIcerikleri, type OzelListe } from "@/lib/kutuphane";
import { IcerikIzgarasi } from "@/components/liste/icerik-izgarasi";
import { ListeAyarlari } from "@/components/liste/liste-ayarlari";
import { TipFiltresi } from "@/components/liste/tip-filtresi";

const ozelMi = (k: string): k is OzelListe => Object.hasOwn(OZEL_LISTELER, k);
const tipAl = (t: unknown): IcerikTipi | undefined => (t === "film" || t === "dizi" ? t : undefined);

const BOS = {
    "sonra-izle": "Henüz kenara ayırdığın bir şey yok. Bir film ya da dizide “İzleyeceğim”e bas.",
    izliyorum: "Takip ettiğin dizi yok. Bir dizide bölüm işaretlemeye başla.",
    izlediklerim: "Henüz izlediğin bir şey işaretlemedin.",
    favoriler: "Favorin yok. Sevdiğin içeriklerde kalbe bas.",
} satisfies Record<OzelListe, string>;

export async function generateMetadata({ params }: PageProps<"/listelerim/[kimlik]">): Promise<Metadata> {
    const { kimlik } = await params;
    if (ozelMi(kimlik)) return { title: OZEL_LISTELER[kimlik].ad };
    const l = await listeDetayi(kimlik, (await oturumAl())?.user?.id);
    return { title: l?.ad ?? "Liste" };
}

export default async function ListeSayfasi({ params, searchParams }: PageProps<"/listelerim/[kimlik]">) {
    const [{ kimlik }, { tip: t }] = await Promise.all([params, searchParams]);
    const tip = tipAl(t);
    const userId = (await oturumAl())?.user?.id;
    const yol = `/listelerim/${kimlik}`;

    if (ozelMi(kimlik)) {
        if (!userId) redirect(`/giris?geri=${yol}`);
        const bilgi = OZEL_LISTELER[kimlik];
        const kartlar = await ozelListeIcerikleri(userId, kimlik, tip);
        const durumlar = kimlik === "favoriler" ? await durumHaritasi(userId, kartlar) : undefined;
        return (
            <Cerceve geri={!!userId}>
                <div className={cn("mb-8 overflow-hidden rounded-3xl bg-linear-to-br p-6 sm:p-8", bilgi.renk)}>
                    <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{bilgi.ad}</h1>
                    <p className="mt-1.5 text-white/80">{bilgi.aciklama}</p>
                    <p className="mt-4 text-sm font-semibold text-white/90">{kartlar.length} içerik</p>
                </div>
                <div className="mb-6"><TipFiltresi yol={yol} secili={tip} /></div>
                <IcerikIzgarasi kartlar={kartlar} durumlar={durumlar} bosMetin={BOS[kimlik]} />
            </Cerceve>
        );
    }

    const liste = await listeDetayi(kimlik, userId, tip);
    if (!liste) notFound();
    const durumlar = await durumHaritasi(userId, liste.kartlar);
    return (
        <Cerceve geri={!!userId}>
            <div className="mb-8 flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight sm:text-4xl">
                        <span className="truncate">{liste.ad}</span>
                        {liste.gizli && <Lock className="size-5 shrink-0 text-foreground/50" aria-label="Gizli liste" />}
                    </h1>
                    {liste.aciklama && <p className="mt-2 max-w-2xl text-foreground/65">{liste.aciklama}</p>}
                    <p className="mt-3 text-sm text-foreground/45">
                        {liste.user.name ?? liste.user.username} · {liste.kartlar.length} içerik
                    </p>
                </div>
                {liste.sahibi && <ListeAyarlari key={`${liste.ad}-${liste.aciklama}-${liste.gizli}`} liste={liste} />}
            </div>
            <div className="mb-6"><TipFiltresi yol={yol} secili={tip} /></div>
            <IcerikIzgarasi
                kartlar={liste.kartlar}
                durumlar={durumlar}
                listeId={liste.sahibi ? liste.id : undefined}
                bosMetin={liste.sahibi ? "Liste boş. Film ve dizi sayfalarındaki + düğmesiyle ekleyebilirsin." : "Bu liste boş."}
            />
        </Cerceve>
    );
}

function Cerceve({ geri, children }: { geri: boolean; children: React.ReactNode }) {
    return (
        <main className="mx-auto w-full max-w-7xl px-4 pb-10 pt-20 sm:px-8 lg:pt-10">
            {geri && (
                <Link href="/listelerim" className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-foreground/55 transition hover:text-foreground">
                    <ChevronLeft className="size-4" /> Listelerim
                </Link>
            )}
            {children}
        </main>
    );
}
