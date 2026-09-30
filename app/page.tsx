import { proje } from "@/lib/ayarlar/proje";

export default function AnaSayfa() {
    return (
        <main className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <h1 className="text-5xl font-black tracking-tight">
                izle<span className="text-violet-500">oloji</span>
            </h1>
            <p className="text-lg text-muted-foreground">{proje.baslik2}</p>
            <p className="text-sm text-muted-foreground">Yeniden yapım sürüyor — aşama 1: iskelet.</p>
        </main>
    );
}
