import { oturumAl } from "@/lib/oturum";
import { MisafirUstCubugu } from "@/components/site/misafir-ust-cubugu";
import { AramaSaglayici } from "@/components/arama/arama-penceresi";

// İçerik sayfaları (film, dizi, oyuncu) misafire de açık: giriş yapmamışsa basit üst çubuk
// ve TMDB atfı eklenir. Giriş yapmışsa iskelet zaten üst layout'tan gelir.
export default async function IcerikDuzeni({ children }: LayoutProps<"/">) {
    const oturum = await oturumAl();
    if (oturum?.user) return children;
    return (
        <AramaSaglayici>
            <div className="flex min-h-dvh flex-col bg-background text-foreground">
                <MisafirUstCubugu />
                <div className="flex-1">{children}</div>
                <footer className="border-t border-foreground/10 px-4 py-8 text-center text-xs text-foreground/35 sm:px-8">
                    Film ve dizi verileri ile görseller TMDB&apos;den sağlanır. Bu ürün TMDB tarafından onaylanmamıştır.
                </footer>
            </div>
        </AramaSaglayici>
    );
}
