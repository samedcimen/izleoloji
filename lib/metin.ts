// Türkçe kurallarıyla küçük harfe çevirir (İ → i, I → ı).
export function kucukHarf(metin: string) {
    return metin.toLocaleLowerCase("tr-TR");
}

// User.aramaMetni kolonu için: ad ve kullanıcı adını tek, küçük harfli metinde birleştirir.
// SQLite LIKE Türkçe karakterlerde büyük/küçük harf ayırdığından arama bu kolonda
// kucukHarf(sorgu) ile yapılır.
export function aramaMetniOlustur(ad: string | null | undefined, kullaniciAdi: string | null | undefined) {
    return kucukHarf([ad, kullaniciAdi].filter(Boolean).join(" ").trim());
}
