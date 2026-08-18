import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/lib/i18n";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth/login", { replace: true });
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="p-4 text-muted-foreground">{t("common.loading")}</div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
