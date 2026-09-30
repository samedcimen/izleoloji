import "dotenv/config";
import { defineConfig } from "prisma/config";

// Uygulama verisi tamamen Turso'da (DATABASE_URL). Prisma CLI libsql:// adreslerine
// migrate yapamadığı için yeni migration SQL'lerini üretirken yalnızca bu geçici,
// boş SQLite dosyasını kullanır; SQL'ler sonra scripts/turso-migrate.mjs ile Turso'ya gönderilir.
export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: "file:./prisma/.migrate.db",
    },
});
