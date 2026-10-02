import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { oturumAl } from "@/lib/oturum";
import { profilUrl } from "@/lib/tmdb/gorsel";
import { ARAMA_EN_KISA, ARAMA_EN_UZUN, aramaSayfasi, type AramaSekmesi, type KisiSonucu, type KullaniciSonucu } from "@/lib/arama";
import { durumHaritasi } from "@/lib/kutuphane";
import { PosterKarti, type KartDurumu } from "@/components/icerik/poster-karti";
import { Avatar } from "@/components/site/kullanici-menusu";

const SEKMELER: { id: AramaSekmesi; ad: string }[] = [
    { id: "tumu", ad: "Tümü" },
    { id: "film", ad: "Filmler" },
    { id: "dizi", ad: "Diziler" },
    { id: "kisi", ad: "Kişiler" },
    { id: "kullanici", ad: "Kullanıcılar" },
];

const tek = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function parametreler(sp: Record<string, string | string[] | undefined>) {
    const q = (tek(sp.q) ?? "").trim().slice(0, ARAMA_EN_UZUN);
    const t = tek(sp.tip);
    const sekme = SEKMELER.some((s) => s.id === t) ? (t as AramaSekmesi) : "tumu";
    const sayfa = Math.min(500, Math.max(1, Number.parseInt(tek(sp.sayfa) ?? "1", 10) || 1));
    return { q, sekme, sayfa };
}

const adres = (q: string, sekme: AramaSekmesi, sayfa = 1) => {
    const p = new URLSearchParams({ q });
    if (sekme !== "tumu") p.set("tip", sekme);
    if (sayfa > 1) p.set("sayfa", String(sayfa));
    return `/ara?${p}`;
};

export async function generateMetadata({ searchParams }: PageProps<"/ara">): Promise<Metadata> {
    const { q } = parametreler(await searchParams);
    return { title: q ? `“${q}” araması` : "Ara", robots: { index: false } };
}

export default async function AraSayfasi({ searchParams }: PageProps<"/ara">) {
    const { q, sekme, sayfa } = parametreler(await searchParams);
    const userId = (await oturumAl())?.user?.id;
    const yeterli = q.length >= ARAMA_EN_KISA;
    const veri = yeterli ? await aramaSayfasi(q, sekme, sayfa).catch(() => null) : null;

    const kartlar = !veri ? [] : veri.sekme === "tumu" ? veri.hizli.icerikler : veri.sekme === "film" || veri.sekme === "dizi" ? veri.icerikler : [];
    const durumlar = await durumHaritasi(userId, kartlar);

    return (
        <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-20 sm:px-8 lg:pt-10">
            <form action="/ara" className="relative">
                <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-white/45" />
                <input
                    name="q"
                    defaultValue={q}
                    key={q}
                    autoFocus={!q}
                    maxLength={ARAMA_EN_UZUN}
                    placeholder="Film, dizi, oyuncu ya da kullanıcı ara"
                    aria-label="Ara"
                    autoComplete="off"
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 pl-14 pr-28 text-base outline-none transition placeholder:text-white/35 focus:border-violet-400 focus:ring-4 focus:ring-violet-400/15"
                />
                {sekme !== "tumu" && <input type="hidden" name="tip" value={sekme} />}
                <button type="submit" className="absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-xl bg-linear-to-br from-violet-700 to-violet-500 px-5 text-sm font-bold text-white transition hover:brightness-110">
                    Ara
                </button>
            </form>

            {yeterli && (
                <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" aria-label="Arama türü">
                    {SEKMELER.map((s) => (
                        <Link
                            key={s.id}
                            href={adres(q, s.id)}
                            aria-current={s.id === sekme ? "page" : undefined}
                            className={cn(
                                "shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition",
                                s.id === sekme ? "border-violet-400/60 bg-violet-500/20 text-white" : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white",
                            )}
                        >
                            {s.ad}
                        </Link>
                    ))}
                </nav>
            )}

            <div className="mt-8">
                {!yeterli ? (
                    <Bos metin={q ? "Aramak için en az 2 harf yaz." : "Ne izlemek istiyorsun? Bir film, dizi, oyuncu ya da kullanıcı adı yaz."} />
                ) : !veri ? (
                    <Bos metin="Arama şu an yapılamıyor, biraz sonra tekrar dene." />
                ) : veri.sekme === "tumu" ? (
                    veri.hizli.icerikler.length + veri.hizli.kisiler.length + veri.hizli.kullanicilar.length === 0 ? (
                        <Bos metin={`“${q}” için sonuç bulunamadı.`} />
                    ) : (
                        <div className="space-y-12">
                            {veri.hizli.icerikler.length > 0 && (
                                <Bolum baslik="Filmler ve diziler" baglantilar={[["Tüm filmler", adres(q, "film")], ["Tüm diziler", adres(q, "dizi")]]}>
                                    <IcerikIzgarasi kartlar={veri.hizli.icerikler} durumlar={durumlar} />
                                </Bolum>
                            )}
                            {veri.hizli.kisiler.length > 0 && (
                                <Bolum baslik="Kişiler" baglantilar={[["Tüm kişiler", adres(q, "kisi")]]}>
                                    <KisiIzgarasi kisiler={veri.hizli.kisiler} />
                                </Bolum>
                            )}
                            {veri.hizli.kullanicilar.length > 0 && (
                                <Bolum baslik="Kullanıcılar" baglantilar={[["Tüm kullanıcılar", adres(q, "kullanici")]]}>
                                    <KullaniciIzgarasi kullanicilar={veri.hizli.kullanicilar} />
                                </Bolum>
                            )}
                        </div>
                    )
                ) : veri.toplam === 0 ? (
                    <Bos metin={`“${q}” için ${SEKMELER.find((s) => s.id === sekme)!.ad.toLocaleLowerCase("tr-TR")} arasında sonuç bulunamadı.`} />
                ) : (
                    <>
                        <p className="mb-5 text-sm text-foreground/50">{veri.toplam.toLocaleString("tr-TR")} sonuç</p>
                        {veri.sekme === "kisi" ? (
                            <KisiIzgarasi kisiler={veri.kisiler} />
                        ) : veri.sekme === "kullanici" ? (
                            <KullaniciIzgarasi kullanicilar={veri.kullanicilar} />
                        ) : (
                            <IcerikIzgarasi kartlar={veri.icerikler} durumlar={durumlar} />
                        )}
                        <Sayfalama q={q} sekme={sekme} sayfa={sayfa} toplam={veri.toplamSayfa} />
                    </>
                )}
            </div>
        </main>
    );
}

function Bos({ metin }: { metin: string }) {
    return <p className="rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center text-foreground/50">{metin}</p>;
}

function Bolum({ baslik, baglantilar, children }: { baslik: string; baglantilar: [string, string][]; children: React.ReactNode }) {
    return (
        <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
                <h2 className="text-lg font-bold">{baslik}</h2>
                <div className="flex gap-4">
                    {baglantilar.map(([ad, href]) => (
                        <Link key={href} href={href} className="text-sm font-semibold text-violet-300 transition hover:text-violet-200">{ad}</Link>
                    ))}
                </div>
            </div>
            {children}
        </section>
    );
}

const IZGARA = "grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-x-4 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))]";

function IcerikIzgarasi({ kartlar, durumlar }: { kartlar: Parameters<typeof PosterKarti>[0]["icerik"][]; durumlar: Record<string, KartDurumu> }) {
    return (
        <ul className={IZGARA}>
            {kartlar.map((k, i) => (
                <li key={`${k.tip}-${k.id}`}>
                    <PosterKarti icerik={k} durum={durumlar[`${k.tip}-${k.id}`]} oncelikli={i < 6} className="w-full" />
                </li>
            ))}
        </ul>
    );
}

function KisiIzgarasi({ kisiler }: { kisiler: KisiSonucu[] }) {
    return (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-x-4 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(9rem,1fr))]">
            {kisiler.map((k) => (
                <li key={k.id}>
                    <Link href={`/oyuncu/${k.id}`} className="group block text-center">
                        <div className="relative mx-auto aspect-square w-full max-w-32 overflow-hidden rounded-full bg-white/5 ring-2 ring-white/10 transition group-hover:ring-violet-400">
                            {k.profilPath ? (
                                <Image src={profilUrl(k.profilPath)} alt={k.ad} fill unoptimized sizes="128px" className="object-cover transition duration-500 group-hover:scale-105" />
                            ) : (
                                <UserRound className="absolute inset-0 m-auto size-10 text-white/25" />
                            )}
                        </div>
                        <p className="mt-2.5 line-clamp-1 text-sm font-semibold transition group-hover:text-violet-300">{k.ad}</p>
                        <p className="line-clamp-1 text-xs text-foreground/45">{k.alan}</p>
                        {k.bilinen.length > 0 && <p className="line-clamp-1 text-xs text-foreground/35">{k.bilinen.join(", ")}</p>}
                    </Link>
                </li>
            ))}
        </ul>
    );
}

function KullaniciIzgarasi({ kullanicilar }: { kullanicilar: KullaniciSonucu[] }) {
    return (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {kullanicilar.map((u) => (
                <li key={u.id}>
                    <Link href={`/kullanici/${u.kullaniciAdi}`} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-violet-400/50 hover:bg-white/10">
                        <Avatar kullanici={{ ad: u.ad, kullaniciAdi: u.kullaniciAdi, resim: u.resim }} className="size-12" />
                        <span className="min-w-0">
                            <span className="block truncate font-semibold">{u.ad ?? u.kullaniciAdi}</span>
                            <span className="block truncate text-sm text-foreground/50">@{u.kullaniciAdi}</span>
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}

function Sayfalama({ q, sekme, sayfa, toplam }: { q: string; sekme: AramaSekmesi; sayfa: number; toplam: number }) {
    if (toplam <= 1) return null;
    const dugme = "flex h-10 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold transition hover:bg-white/10";
    return (
        <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Sayfalar">
            {sayfa > 1 ? (
                <Link href={adres(q, sekme, sayfa - 1)} className={dugme}><ChevronLeft className="size-4" />Önceki</Link>
            ) : <span className={cn(dugme, "pointer-events-none opacity-40")}><ChevronLeft className="size-4" />Önceki</span>}
            <span className="text-sm text-foreground/55">{sayfa} / {toplam}</span>
            {sayfa < toplam ? (
                <Link href={adres(q, sekme, sayfa + 1)} className={dugme}>Sonraki<ChevronRight className="size-4" /></Link>
            ) : <span className={cn(dugme, "pointer-events-none opacity-40")}>Sonraki<ChevronRight className="size-4" /></span>}
        </nav>
    );
}
