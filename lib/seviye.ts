// Seviye sistemi: XP'den seviye, sonraki seviye ve ilerleme hesaplanır.
// Hem sunucu hem tarayıcı tarafında kullanılabilir (veritabanına bağlı değil).
export const SEVIYELER = [
    { no: 1, ad: "Seyirci", esik: 0 },
    { no: 2, ad: "Meraklı", esik: 150 },
    { no: 3, ad: "Sinefil", esik: 400 },
    { no: 4, ad: "Eleştirmen", esik: 800 },
    { no: 5, ad: "Kulis", esik: 1500 },
    { no: 6, ad: "Senarist", esik: 2500 },
    { no: 7, ad: "Yapımcı", esik: 4000 },
    { no: 8, ad: "Yönetmen", esik: 6000 },
    { no: 9, ad: "Usta", esik: 9000 },
    { no: 10, ad: "Efsane", esik: 13000 },
] as const;

export type SeviyeBilgisi = {
    no: number;
    ad: string;
    xp: number;
    sonrakiEsik: number | null; // son seviyede null
    ilerleme: number; // 0-100, mevcut seviyeden sonrakine
};

export function seviyeHesapla(xp: number): SeviyeBilgisi {
    const deger = Math.max(0, Math.floor(xp));
    const sira = SEVIYELER.findLastIndex((s) => deger >= s.esik);
    const mevcut = SEVIYELER[sira];
    const sonraki = SEVIYELER[sira + 1];
    return {
        no: mevcut.no,
        ad: mevcut.ad,
        xp: deger,
        sonrakiEsik: sonraki?.esik ?? null,
        ilerleme: sonraki ? Math.round(((deger - mevcut.esik) / (sonraki.esik - mevcut.esik)) * 100) : 100,
    };
}

// XP kazanımları — izleme kaydıyla aynı veritabanı işleminde uygulanır (lib/kutuphane.ts)
export const XP = {
    IZLEDI: 10, // film/dizi "izledim"
    PUAN: 5, // ilk kez puan verme
    BOLUM: 1, // dizi bölümü izlendi
} as const;
