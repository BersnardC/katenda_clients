import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Field } from "@/components/auth/Field";

export function Component() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
      toast.success(t("auth.recoverySent"));
    }, 700);
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
