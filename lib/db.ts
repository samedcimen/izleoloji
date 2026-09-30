import "server-only";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { env } from "@/lib/env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function istemciOlustur() {
    const adapter = new PrismaLibSql({
        url: env.DATABASE_URL,
        authToken: env.DATABASE_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? istemciOlustur();

// Geliştirmede hot reload her seferinde yeni bağlantı açmasın
if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
