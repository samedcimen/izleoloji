import { oauthSaglayicilari } from "@/auth";
import { oauthIleGiris } from "@/app/actions/oturum";
import { Ayrac } from "./form-parcalari";

// lucide marka ikonlarını kaldırdığı için logolar burada
const LOGOLAR: Record<string, React.ReactNode> = {
    google: (
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.7z" />
            <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z" />
            <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.7V6.6H1.4a12 12 0 0 0 0 10.8l4-3z" />
            <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
        </svg>
    ),
    github: (
        <svg viewBox="0 0 24 24" className="size-5 fill-white" aria-hidden>
            <path d="M12 .5C5.7.5.5 5.7.5 12.1c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6a11.6 11.6 0 0 0 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
        </svg>
    ),
};

export function OAuthButonlari({ geri, ayracMetni }: { geri: string; ayracMetni: string }) {
    if (oauthSaglayicilari.length === 0) return null;
    return (
        <>
            <div className="grid gap-2.5">
                {oauthSaglayicilari.map((s) => (
                    <form key={s.id} action={oauthIleGiris.bind(null, s.id, geri)}>
                        <button
                            type="submit"
                            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-white/15 bg-white/5 text-sm font-semibold text-white/90 transition hover:bg-white/10 active:scale-[0.98]"
                        >
                            {LOGOLAR[s.id]}
                            {s.ad} ile devam et
                        </button>
                    </form>
                ))}
            </div>
            <Ayrac>{ayracMetni}</Ayrac>
        </>
    );
}
