"use client";

import { ThemeProvider } from "next-themes";

// Tema <html> sınıfıyla uygulanır (dark). Varsayılan koyu; seçim tarayıcıda saklanır,
// next-themes sayfa çizilmeden önce uyguladığı için açılışta yanıp sönme olmaz.
export function TemaSaglayici({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            {children}
        </ThemeProvider>
    );
}
