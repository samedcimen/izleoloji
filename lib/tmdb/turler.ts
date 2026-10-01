// TMDB tür listesi (Türkçe). API'den her seferinde çekmek yerine sabit tutulur;
// TMDB türleri yıllardır değişmiyor. film/dizi: hangi tipte geçerli olduğu.
export const TURLER = [
    { id: 28, ad: "Aksiyon", film: true, dizi: false, emoji: "💥" },
    { id: 10759, ad: "Aksiyon & Macera", film: false, dizi: true, emoji: "💥" },
    { id: 12, ad: "Macera", film: true, dizi: false, emoji: "🧭" },
    { id: 16, ad: "Animasyon", film: true, dizi: true, emoji: "🎨" },
    { id: 35, ad: "Komedi", film: true, dizi: true, emoji: "😂" },
    { id: 80, ad: "Suç", film: true, dizi: true, emoji: "🕵️" },
    { id: 99, ad: "Belgesel", film: true, dizi: true, emoji: "🎥" },
    { id: 18, ad: "Dram", film: true, dizi: true, emoji: "🎭" },
    { id: 10751, ad: "Aile", film: true, dizi: true, emoji: "👨‍👩‍👧" },
    { id: 14, ad: "Fantastik", film: true, dizi: false, emoji: "🐉" },
    { id: 10765, ad: "Bilim Kurgu & Fantazi", film: false, dizi: true, emoji: "🚀" },
    { id: 36, ad: "Tarih", film: true, dizi: false, emoji: "🏛️" },
    { id: 27, ad: "Korku", film: true, dizi: false, emoji: "👻" },
    { id: 10402, ad: "Müzik", film: true, dizi: false, emoji: "🎵" },
    { id: 9648, ad: "Gizem", film: true, dizi: true, emoji: "🔍" },
    { id: 10749, ad: "Romantik", film: true, dizi: false, emoji: "❤️" },
    { id: 878, ad: "Bilim Kurgu", film: true, dizi: false, emoji: "🚀" },
    { id: 53, ad: "Gerilim", film: true, dizi: false, emoji: "😱" },
    { id: 10752, ad: "Savaş", film: true, dizi: false, emoji: "⚔️" },
    { id: 10768, ad: "Savaş & Politik", film: false, dizi: true, emoji: "⚔️" },
    { id: 37, ad: "Western", film: true, dizi: true, emoji: "🤠" },
    { id: 10762, ad: "Çocuk", film: false, dizi: true, emoji: "🧸" },
    { id: 10764, ad: "Reality", film: false, dizi: true, emoji: "📺" },
] as const;

const AD = new Map<number, string>(TURLER.map((t) => [t.id, t.ad]));
export const turAdi = (id: number) => AD.get(id);

// Ana sayfadaki "türe göre keşfet" seçenekleri: hem film hem dizi tarafı olan/ağırlıklı türler.
// dizi: dizi tarafında karşılık gelen tür id'si (TMDB'de bazıları farklı).
export const KESIF_TURLERI = [
    { ad: "Aksiyon", emoji: "💥", film: 28, dizi: 10759 },
    { ad: "Komedi", emoji: "😂", film: 35, dizi: 35 },
    { ad: "Dram", emoji: "🎭", film: 18, dizi: 18 },
    { ad: "Bilim Kurgu", emoji: "🚀", film: 878, dizi: 10765 },
    { ad: "Korku", emoji: "👻", film: 27, dizi: null },
    { ad: "Suç", emoji: "🕵️", film: 80, dizi: 80 },
    { ad: "Romantik", emoji: "❤️", film: 10749, dizi: null },
    { ad: "Animasyon", emoji: "🎨", film: 16, dizi: 16 },
    { ad: "Gizem", emoji: "🔍", film: 9648, dizi: 9648 },
    { ad: "Belgesel", emoji: "🎥", film: 99, dizi: 99 },
] as const;
