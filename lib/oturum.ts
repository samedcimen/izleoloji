import "server-only";
import { cache } from "react";
import { auth } from "@/auth";

// Aynı istekte layout, sayfa ve not-found ayrı ayrı sorsa da oturum bir kez okunur.
// auth() hata verirse (ör. AUTH_SECRET eksik) sayfa çökmesin, misafir sayılsın.
export const oturumAl = cache(() => auth().catch(() => null));
