import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound, Lock, ShieldAlert } from "lucide-react";
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
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");
  const email = params.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const invalidLink = !token || !email;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !passwordConfirmation || password !== passwordConfirmation) {
      return;
    }
    setSubmitting(true);
    try {
      await authService.resetPassword({
        email,
        token: token ?? "",
        password,
        password_confirmation: passwordConfirmation,
      });
      toast.success(t("auth.resetSuccess"));
      navigate("/auth/login", { replace: true });
    } catch (err) {
      toast.error(errMsg(err, t("auth.resetError")));
    } finally {
      setSubmitting(false);
    }
  };

  const passwordMismatch =
    password !== passwordConfirmation && passwordConfirmation.length > 0;

  return (
    <AuthLayout
      title={t("auth.resetTitle")}
      subtitle={t("auth.resetSub")}
      backTo="/auth/login"
    >
      {invalidLink ? (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-3xl bg-card border border-border p-6 text-center">
          <span className="size-12 grid place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldAlert className="size-6" />
          </span>
          <p className="text-sm text-muted-foreground">{t("auth.invalidLink")}</p>
          <Link
            to="/auth/recoverypass"
            className="px-4 py-2.5 rounded-2xl gradient-brand text-primary-foreground font-semibold shadow-pop"
          >
            {t("cta.recover")}
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-3">
          <Field
            icon={<Lock className="size-5" />}
            placeholder={t("auth.password")}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Field
            icon={<KeyRound className="size-5" />}
            placeholder={t("auth.passwordConfirm")}
            type="password"
            autoComplete="new-password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />
          {passwordMismatch && (
            <p className="text-xs text-destructive">{t("auth.passwordMismatch")}</p>
          )}
          <button
            disabled={submitting || passwordMismatch}
            className="w-full py-4 rounded-2xl gradient-brand text-primary-foreground font-semibold shadow-pop disabled:opacity-60"
          >
            {submitting ? t("common.loading") : t("cta.recover")}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
