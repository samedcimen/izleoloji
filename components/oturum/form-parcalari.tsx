"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { CircleAlert, CircleCheck, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AlanProps = React.ComponentProps<"input"> & {
    ad: string;
    etiket: string;
    hatalar?: string[];
    ipucu?: React.ReactNode;
    sag?: React.ReactNode;
};

export function Alan({ ad, etiket, hatalar, ipucu, sag, className, ...props }: AlanProps) {
    const hataVar = !!hatalar?.length;
    const aciklamaId = `${ad}-aciklama`;
    return (
        <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
                <Label htmlFor={ad} className="text-white/80">{etiket}</Label>
                {sag}
            </div>
            <Input
                // Hatalı gönderimden sonra defaultValue değişir (girilen değer geri verilir); Base UI
                // başlangıç değerinin sonradan değişmesine izin vermediği için alan yeniden oluşturulur
                key={props.defaultValue === undefined ? undefined : String(props.defaultValue)}
                id={ad}
                name={ad}
                aria-invalid={hataVar || undefined}
                aria-describedby={hataVar || ipucu ? aciklamaId : undefined}
                className={cn("h-11 rounded-xl border-white/10 bg-white/5 px-3.5 text-white placeholder:text-white/30", className)}
                {...props}
            />
            <div id={aciklamaId}>
                {hataVar
                    ? hatalar!.map((h) => (
                        <p key={h} className="flex items-start gap-1.5 text-xs text-red-300">
                            <CircleAlert className="mt-px size-3.5 shrink-0" />
                            {h}
                        </p>
                    ))
                    : ipucu}
            </div>
        </div>
    );
}

export function SifreAlani(props: Omit<AlanProps, "type">) {
    const [gorunur, setGorunur] = useState(false);
    return (
        <div className="relative">
            <Alan {...props} type={gorunur ? "text" : "password"} className="pr-11" />
            <button
                type="button"
                onClick={() => setGorunur((g) => !g)}
                className="absolute right-1.5 top-[1.9rem] grid size-8 place-items-center rounded-lg text-white/45 transition hover:bg-white/10 hover:text-white"
                aria-label={gorunur ? "Şifreyi gizle" : "Şifreyi göster"}
            >
                {gorunur ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
        </div>
    );
}

export function GonderButonu({ children }: { children: React.ReactNode }) {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-linear-to-br from-violet-700 to-violet-500 font-bold text-white shadow-[0_8px_30px_-6px_rgb(124_58_237/0.7)] transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
        >
            {pending && <LoaderCircle className="size-4 animate-spin" />}
            {children}
        </button>
    );
}

export function FormMesaji({ mesaj, basarili }: { mesaj?: string; basarili?: boolean }) {
    if (!mesaj) return null;
    const Ikon = basarili ? CircleCheck : CircleAlert;
    return (
        <p
            role={basarili ? "status" : "alert"}
            className={cn(
                "flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm",
                basarili ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200" : "border-red-400/25 bg-red-400/10 text-red-200",
            )}
        >
            <Ikon className="mt-0.5 size-4 shrink-0" />
            {mesaj}
        </p>
    );
}

export function Ayrac({ children }: { children: React.ReactNode }) {
    return (
        <div className="my-6 flex items-center gap-3 text-xs text-white/35">
            <span className="h-px flex-1 bg-white/10" />
            {children}
            <span className="h-px flex-1 bg-white/10" />
        </div>
    );
}
