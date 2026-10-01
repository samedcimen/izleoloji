import Link from "next/link";

// Giriş yapmamış ziyaretçinin içerik sayfalarındaki (detay vb.) üst çubuğu
export function MisafirUstCubugu() {
    return (
        <header className="fixed inset-x-0 top-0 z-40 bg-linear-to-b from-black/70 to-transparent">
            <div className="flex h-16 items-center gap-3 px-4 sm:px-8">
                <Link href="/" className="text-2xl font-black tracking-tight text-white">
                    izle<span className="bg-linear-to-br from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">oloji</span>
                </Link>
                <div className="ml-auto flex items-center gap-2">
                    <Link href="/giris" className="rounded-full px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-white">
                        Giriş yap
                    </Link>
                    <Link
                        href="/kayit"
                        className="rounded-full bg-linear-to-br from-violet-700 to-violet-500 px-4 py-2 text-sm font-bold text-white shadow-[0_6px_20px_-6px_rgb(124_58_237/0.7)] transition hover:brightness-110"
                    >
                        Ücretsiz katıl
                    </Link>
                </div>
            </div>
        </header>
    );
}
