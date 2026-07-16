import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Button } from "@katenda_clients/ui";
import { Input } from "@katenda_clients/ui";
import { Label } from "@katenda_clients/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/lib/i18n";

export default function Login() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch {
      // error handled in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-card rounded-3xl p-6">
        <h1 className="text-2xl font-bold mb-1">{t("auth.login")}</h1>
        <p className="text-sm text-muted-foreground mb-6">Entra para administrar tu negocio.</p>

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
          <div className="space-y-1.5">
            <Label>{t("auth.password")}</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={submitting || loading}
            className="w-full h-12 bg-accent text-accent-foreground hover:opacity-90 font-semibold mt-2 cursor-pointer"
          >
            {submitting ? "Entrando..." : t("auth.login")}
          </Button>
        </form>

        <div className="flex flex-col items-center gap-2 mt-5 text-sm">
          <Link to="/recover-password" className="text-brand font-medium hover:underline">
            {t("auth.recover")}
          </Link>
          <p className="text-muted-foreground">
            {t("auth.no")}{" "}
            <Link to="/register" className="text-brand font-medium hover:underline">
              {t("auth.register")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
