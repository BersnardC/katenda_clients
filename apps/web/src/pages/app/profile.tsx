import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { PlaceholderPage } from "@/components/PlaceholderPage";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/lib/i18n";

export function Component() {
  const { t } = useI18n();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth/login", { replace: true });
  };

  return (
    <>
      <PlaceholderPage title={t("profile.title")} />
      <div className="px-5 pb-10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-destructive/30 text-destructive font-semibold transition active:scale-[0.98]"
        >
          <LogOut className="size-5" />
          {t("profile.logout")}
        </button>
      </div>
    </>
  );
}
