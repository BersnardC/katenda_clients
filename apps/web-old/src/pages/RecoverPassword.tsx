import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Input, Label } from "@katenda_clients/ui";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export default function RecoverPassword() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    // TODO: conectar con endpoint real cuando esté disponible
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setSubmitting(false);
    toast.success("Revisa tu correo para restablecer la contraseña");
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-card rounded-3xl p-6">
        <h1 className="text-2xl font-bold mb-1">{t("auth.recover")}</h1>
        <p className="text-sm text-muted-foreground mb-6">{t("auth.recover_desc")}</p>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-brand/20 grid place-items-center mx-auto">
              <svg className="h-8 w-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">
              Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.
            </p>
            <Link
              to="/login"
              className="inline-block text-sm text-brand font-medium hover:underline"
            >
              {t("auth.back_login")}
            </Link>
          </div>
        ) : (
          <form onSubmit={handle} className="space-y-3">
            <div className="space-y-1.5">
              <Label>{t("auth.email")}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 bg-accent text-accent-foreground hover:opacity-90 font-semibold mt-2 cursor-pointer"
            >
              {submitting ? "Enviando..." : t("auth.send_link")}
            </Button>
          </form>
        )}

        <div className="text-center mt-5">
          <Link to="/login" className="text-sm text-brand font-medium hover:underline">
            {t("auth.back_login")}
          </Link>
        </div>
      </div>
    </div>
  );
}
