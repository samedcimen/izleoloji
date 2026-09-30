# izleoloji

Film ve dizi takibi için sosyal platform. `izleoloji-eski` projesinin sıfırdan, aşama aşama yeniden yapımı.

**Teknoloji:** Next.js 16 · React 19 · TypeScript · Tailwind 4 + shadcn · Prisma 7 · Turso (libSQL/SQLite) · Vercel

## Geliştirme

```bash
npm install            # prisma generate otomatik çalışır
cp .env.example .env   # değerleri doldur
npm run db:migrate     # yerel dev.db'yi oluşturur / günceller
npm run dev            # http://localhost:3020
```

Yerelde veritabanı proje kökündeki `dev.db` SQLite dosyasıdır, Turso hesabı gerekmez.

## Script'ler

| Komut | Ne yapar |
|---|---|
| `npm run db:migrate` | Şema değişikliğinden migration üretir ve yerel DB'ye uygular |
| `npm run db:studio` | Prisma Studio |
| `npm run db:reset` | Yerel DB'yi sıfırlar (**veriler silinir**) |
| `npm run db:turso` | Bekleyen migration'ları Turso'ya uygular (`.env.turso` gerekir) |
| `npm run typecheck` | TypeScript kontrolü |

## Turso'ya yayın

1. [turso.tech](https://turso.tech) üzerinden veritabanı oluştur, URL ve token al.
2. `.env.turso` dosyasına `TURSO_DATABASE_URL` ve `TURSO_AUTH_TOKEN` yaz, `npm run db:turso` çalıştır.
3. Vercel'de ortam değişkenleri: `DATABASE_URL` (libsql://…), `DATABASE_AUTH_TOKEN`, `APP_URL` ve diğerleri (`.env.example`).

Sağlık kontrolü: `GET /api/saglik`
