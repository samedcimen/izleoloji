"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Tarayıcı geçmişinde bir önceki sayfaya döner; geçmiş yoksa (adres doğrudan açıldıysa) ana sayfaya
export function GeriButonu() {
    const router = useRouter();
    return (
        <button
            type="button"
            onClick={() => (history.length > 1 ? router.back() : router.push("/"))}
            className="flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 font-semibold text-white/85 transition hover:bg-white/10 active:scale-[0.98]"
        >
            <ArrowLeft className="size-4" />
            Geri dön
        </button>
    );
}
