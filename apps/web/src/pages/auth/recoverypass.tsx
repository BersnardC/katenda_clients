import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { useI18n } from "@/lib/i18n";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Field } from "@/components/auth/Field";

const errMsg = (e: unknown, fallback: string) =>
  e instanceof Error && e.message ? e.message : fallback;

export function Component() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || submitting || sent) return;
    setSubmitting(true);
    try {
      await authService.forgotPassword({ email });
      setSent(true);
      toast.success(t("auth.recoverySent"));
    } catch (err) {
      toast.error(errMsg(err, t("auth.resetError")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={t("auth.recoverTitle")}
      subtitle={t("auth.recoverSub")}
      backTo="/auth/login"
    >
      <form onSubmit={submit} className="mt-8 space-y-3">
        <Field
          icon={<Mail className="size-5" />}
          placeholder={t("auth.email")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          disabled={submitting || sent}
          className="w-full py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold shadow-pop disabled:opacity-60"
        >
          {submitting ? t("common.loading") : t("cta.send")}
        </button>
      </form>
    </AuthLayout>
  );
}
