import { oturumAl } from "@/lib/oturum";
import { UygulamaIskeleti } from "@/components/site/uygulama-iskeleti";

// İç sayfalar: giriş yapmış kullanıcıya yan menülü iskelet. Misafir için sayfa kendi düzenini
// çizer (ana sayfada poster duvarlı karşılama ekranı).
export default async function UygulamaDuzeni({ children }: LayoutProps<"/">) {
    const oturum = await oturumAl();
    if (!oturum?.user) return children;
    return <UygulamaIskeleti kullanici={oturum.user}>{children}</UygulamaIskeleti>;
}
