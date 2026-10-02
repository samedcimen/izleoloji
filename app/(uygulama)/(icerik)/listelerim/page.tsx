import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { oturumAl } from "@/lib/oturum";
import { kutuphaneOzeti } from "@/lib/kutuphane";
import { ListeKarti } from "@/components/liste/liste-karti";
import { YeniListeButonu } from "@/components/liste/yeni-liste-butonu";

export const metadata: Metadata = { title: "Listelerim" };

const IZGARA = "grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-x-4 gap-y-7 sm:grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] sm:gap-x-6";

export default async function ListelerimSayfasi() {
    const userId = (await oturumAl())?.user?.id;
    if (!userId) redirect("/giris?geri=/listelerim");
    const { ozel, listeler } = await kutuphaneOzeti(userId);

    return (
        <main className="mx-auto w-full max-w-7xl px-4 pb-10 pt-20 sm:px-8 lg:pt-10">
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Listelerim</h1>
            <p className="mt-2 text-foreground/55">İzlediklerin, izleyeceklerin ve kendi oluşturduğun listeler.</p>

            <section className="mt-10">
                <h2 className="mb-5 text-lg font-bold">Kütüphanem</h2>
                <div className={IZGARA}>
                    {ozel.map((o) => (
                        <ListeKarti key={o.slug} href={`/listelerim/${o.slug}`} ad={o.ad} aciklama={o.aciklama} sayi={o.sayi} posterler={o.posterler} renk={o.renk} />
                    ))}
                </div>
            </section>

            <section className="mt-14">
                <h2 className="mb-5 text-lg font-bold">
                    Listelerim <span className="text-foreground/40">· {listeler.length}</span>
                </h2>
                <div className={IZGARA}>
                    <YeniListeButonu />
                    {listeler.map((l) => (
                        <ListeKarti key={l.id} href={`/listelerim/${l.id}`} ad={l.ad} aciklama={l.aciklama} sayi={l.sayi} posterler={l.posterler} gizli={l.gizli} />
                    ))}
                </div>
            </section>
        </main>
    );
}
