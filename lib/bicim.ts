// Türkçe biçimlendirme yardımcıları (sunucu ve tarayıcı)

export function sureMetni(dakika: number | null | undefined) {
    if (!dakika) return null;
    const sa = Math.floor(dakika / 60);
    const dk = dakika % 60;
    if (sa && dk) return `${sa} sa ${dk} dk`;
    return sa ? `${sa} sa` : `${dk} dk`;
}

export function tarihMetni(iso: string | null | undefined, secenek: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) {
    if (!iso) return null;
    const t = new Date(iso);
    return Number.isNaN(t.getTime()) ? null : t.toLocaleDateString("tr-TR", { ...secenek, timeZone: "UTC" });
}

// 145000000 → "145 milyon $"
export function paraMetni(dolar: number) {
    if (!dolar) return null;
    if (dolar >= 1e9) return `${(dolar / 1e9).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} milyar $`;
    if (dolar >= 1e6) return `${(dolar / 1e6).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} milyon $`;
    return `${dolar.toLocaleString("tr-TR")} $`;
}

export function yasHesapla(dogum: string, olum?: string | null) {
    const b = new Date(dogum);
    const s = olum ? new Date(olum) : new Date();
    let yas = s.getFullYear() - b.getFullYear();
    if (s.getMonth() < b.getMonth() || (s.getMonth() === b.getMonth() && s.getDate() < b.getDate())) yas--;
    return yas;
}
