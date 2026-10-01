import type { Session } from "next-auth";
import { db } from "@/lib/db";
import { seviyeHesapla } from "@/lib/seviye";
import { YAN_MENU_GENISLIK } from "@/lib/ayarlar/menu";
import { YanMenu } from "./yan-menu";
import { UstMenu } from "./ust-menu";

// Giriş yapmış kullanıcının tüm iç sayfalarının ortak iskeleti: masaüstünde sabit yan menü,
// mobilde üst çubuk (☰ çekmece), en altta TMDB atfı. Sayfalar yalnızca kendi içeriğini çizer.
export async function UygulamaIskeleti({ kullanici, children }: { kullanici: Session["user"]; children: React.ReactNode }) {
    const xp = await db.user.findUnique({ where: { id: kullanici.id }, select: { xp: true } }).then((u) => u?.xp ?? 0);
    const menuKullanici = { ad: kullanici.name ?? null, kullaniciAdi: kullanici.username, resim: kullanici.image ?? null };
    const seviye = seviyeHesapla(xp);

    return (
        <div className={`flex min-h-dvh flex-col bg-background text-foreground ${YAN_MENU_GENISLIK}`}>
            <YanMenu kullanici={menuKullanici} seviye={seviye} />
            <UstMenu kullanici={menuKullanici} seviye={seviye} />
            <div className="flex flex-1 flex-col">{children}</div>
            <footer className="border-t border-foreground/10 px-4 py-8 text-center text-xs text-foreground/35 sm:px-8">
                Film ve dizi verileri ile görseller TMDB&apos;den sağlanır. Bu ürün TMDB tarafından onaylanmamıştır.
            </footer>
        </div>
    );
}
