import "server-only";
import nodemailer from "nodemailer";
import { env } from "@/lib/env";
import { proje } from "@/lib/ayarlar/proje";

type Mail = { kime: string; konu: string; html: string; metin: string };

// Mail gerçekten gönderilebilir mi (geliştirmede terminale yazmak da sayılır)
export function mailHazirMi() {
    return !!(env.RESEND_API_KEY && env.MAIL_FROM) || !!(env.SMTP_USER && env.SMTP_PASS) || env.NODE_ENV !== "production";
}

// Sıra: Resend (API) → Gmail SMTP → geliştirmede terminale yaz.
export async function mailGonder(mail: Mail) {
    if (env.RESEND_API_KEY && env.MAIL_FROM) return resendIle(mail);
    if (env.SMTP_USER && env.SMTP_PASS) return smtpIle(mail);

    if (env.NODE_ENV !== "production") {
        console.log(`\n── MAIL (gönderilmedi, mail servisi tanımlı değil) ──\nKime: ${mail.kime}\nKonu: ${mail.konu}\n\n${mail.metin}\n`);
        return;
    }
    throw new Error("Mail servisi tanımlı değil (RESEND_API_KEY + MAIL_FROM ya da SMTP_USER + SMTP_PASS).");
}

async function resendIle({ kime, konu, html, metin }: Mail) {
    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: `${proje.baslik} <${env.MAIL_FROM}>`, to: kime, subject: konu, html, text: metin }),
    });
    if (!res.ok) throw new Error(`Resend: ${res.status} ${await res.text()}`);
}

let tasiyici: nodemailer.Transporter | undefined;

async function smtpIle({ kime, konu, html, metin }: Mail) {
    tasiyici ??= nodemailer.createTransport({
        service: "gmail",
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
    await tasiyici.sendMail({ from: `"${proje.baslik}" <${env.SMTP_USER}>`, to: kime, subject: konu, html, text: metin });
}

// ── Şablonlar ────────────────────────────────────────────────────────────────

export function sifreSifirlamaMaili(url: string, dakika: number): Omit<Mail, "kime"> {
    return {
        konu: `Şifre sıfırlama — ${proje.baslik}`,
        metin: `Şifreni sıfırlamak için bu bağlantıyı aç (${dakika} dakika geçerli):\n${url}\n\nBu isteği sen yapmadıysan bu maili görmezden gelebilirsin; şifren değişmez.`,
        html: `<!doctype html>
<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0c0a14;color:#fff;border-radius:16px">
  <h1 style="font-size:26px;font-weight:900;margin:0 0 4px">izle<span style="color:#8b5cf6">oloji</span></h1>
  <p style="color:#9ca3af;margin:0 0 28px;font-size:14px">Şifre sıfırlama</p>
  <p style="font-size:15px;color:#e5e7eb;margin:0 0 24px;line-height:1.6">Şifreni sıfırlamak için aşağıdaki butona tıkla. Bağlantı <b>${dakika} dakika</b> geçerli ve yalnızca bir kez kullanılabilir.</p>
  <a href="${url}" style="display:inline-block;padding:14px 28px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:999px;font-weight:700;font-size:15px">Şifremi sıfırla</a>
  <p style="font-size:12px;color:#6b7280;margin:28px 0 0;line-height:1.6">Buton çalışmazsa bu adresi tarayıcına yapıştır:<br><span style="color:#a78bfa;word-break:break-all">${url}</span></p>
  <p style="font-size:12px;color:#6b7280;margin:16px 0 0">Bu isteği sen yapmadıysan bu maili görmezden gelebilirsin; şifren değişmez.</p>
</div>`,
    };
}
