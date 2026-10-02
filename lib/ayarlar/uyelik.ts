// Üyelik kuralları — hem sunucu doğrulaması hem form ipuçları buradan okur.
export const UYELIK = {
    KULLANICI_ADI_MIN: 3,
    KULLANICI_ADI_MAX: 20,
    AD_MIN: 2,
    AD_MAX: 60,
    SIFRE_MIN: 8,
    SIFRE_MAX: 128,

    // 10 tur: OWASP alt sınırı; Vercel'de doğrulama ~80 ms (12 turda ~320 ms). Farklı turla
    // kaydedilmiş eski şifreler girişte bu değere yeniden hash'lenir.
    BCRYPT_TUR: 10,

    // Aynı hesaba art arda hatalı giriş → geçici kilit
    MAX_GIRIS_DENEMESI: 5,
    HESAP_KILIT_DAKIKA: 15,

    // Şifre sıfırlama bağlantısının geçerlilik süresi
    SIFIRLAMA_DAKIKA: 60,

    OTURUM_GUN: 30,
} as const;

export const KULLANICI_ADI_REGEX = new RegExp(`^[a-z0-9_]{${UYELIK.KULLANICI_ADI_MIN},${UYELIK.KULLANICI_ADI_MAX}}$`);

// Profil/sistem yollarıyla çakışmasın diye alınamayan kullanıcı adları
export const YASAKLI_KULLANICI_ADLARI = new Set([
    "admin", "yonetici", "izleoloji", "destek", "api", "giris", "kayit", "cikis", "ayarlar",
    "profil", "kesfet", "radar", "akis", "liste", "listelerim", "film", "dizi", "oyuncu",
    "kullanici", "ara", "sifre_sifirla", "iletisim", "gizlilik", "root", "sistem",
]);

// İstek sınırları: [en fazla istek, pencere (saniye)]
export const LIMITLER = {
    girisIp: [20, 15 * 60],
    kayitIp: [5, 60 * 60],
    sifirlamaIp: [5, 60 * 60],
    sifirlamaEmail: [3, 60 * 60],
    kullaniciAdiKontrolIp: [60, 60],
} as const satisfies Record<string, readonly [number, number]>;
