"use client";

import { useEffect, useRef } from "react";

// Fare konumunu -1..1 aralığında --px / --py CSS değişkenlerine yazar.
// Dokunmatik ekranlarda ve "hareketi azalt" açıkken devre dışı.
export function Paralaks({ className, children }: { className?: string; children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let kare = 0;
        const hareket = (e: PointerEvent) => {
            cancelAnimationFrame(kare);
            kare = requestAnimationFrame(() => {
                el.style.setProperty("--px", ((e.clientX / innerWidth) * 2 - 1).toFixed(3));
                el.style.setProperty("--py", ((e.clientY / innerHeight) * 2 - 1).toFixed(3));
            });
        };

        addEventListener("pointermove", hareket, { passive: true });
        return () => {
            removeEventListener("pointermove", hareket);
            cancelAnimationFrame(kare);
        };
    }, []);

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
}
