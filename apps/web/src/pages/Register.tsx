import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Button, Input, Label } from "@katenda_clients/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/lib/i18n";

export default function Register() {
  const { register, user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !passwordConfirmation) return;
    if (password !== passwordConfirmation) return;
    setSubmitting(true);
    try {
      await register({ name, email, password, password_confirmation: passwordConfirmation });
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
        <h1 className="text-2xl font-bold mb-1">{t("auth.register")}</h1>
        <p className="text-sm text-muted-foreground mb-6">Empieza a gestionar tu negocio.</p>

        <form onSubmit={handle} className="space-y-3">
          <div className="space-y-1.5">
            <Label>{t("auth.name")}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              required
            />
          </div>
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
              placeholder="Mínimo 8 caracteres"
              required
              minLength={8}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Confirmar contraseña</Label>
            <Input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="Repite la contraseña"
              required
            />
          </div>
          {password && passwordConfirmation && password !== passwordConfirmation && (
            <p className="text-xs text-destructive">{t("auth.password_mismatch")}</p>
          )}
          <Button
            type="submit"
            disabled={submitting || loading || (password !== passwordConfirmation && passwordConfirmation.length > 0)}
            className="w-full h-12 bg-accent text-accent-foreground hover:opacity-90 font-semibold mt-2 cursor-pointer"
          >
            {submitting ? "Creando cuenta..." : t("auth.register")}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-5">
          {t("auth.have")}{" "}
          <Link to="/login" className="text-brand font-medium hover:underline">
            {t("auth.login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
