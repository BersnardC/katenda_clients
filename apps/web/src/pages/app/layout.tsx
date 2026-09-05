import { Outlet, useNavigate } from "react-router-dom";
import { LogOut, Store as StoreIcon } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { RequireAuth } from "@/components/RequireAuth";
import { AppProvider } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/lib/i18n";

export function Component() {
  const { user } = useAuth();

  // Cuenta de operación por defecto: remontar el subtree con cada cambio para
  // que todas las páginas (que cargan en mount) refresquen datos del tenant.
  const outletKey = user?.active_account_id != null ? String(user.active_account_id) : "none";
  const hasNoAccounts =
    Array.isArray(user?.accounts) && user.accounts.length === 0;

  return (
    <RequireAuth>
      {hasNoAccounts ? (
        <NoAccountsView />
      ) : (
        <AppProvider>
          <MobileShell>
            <div className="min-h-screen bg-background text-foreground">
              <Outlet key={outletKey} />
            </div>
          </MobileShell>
        </AppProvider>
      )}
    </RequireAuth>
  );
}

function NoAccountsView() {
  const { t } = useI18n();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground grid place-items-center px-6">
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="mx-auto size-16 rounded-2xl bg-muted grid place-items-center text-muted-foreground">
          <StoreIcon className="size-7" />
        </div>
        <div>
          <p className="font-display font-bold text-lg">
            {t("accounts.noTitle")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("accounts.noSub")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-card border border-border text-destructive font-medium"
        >
          <LogOut className="size-5" />
          {t("profile.logout")}
        </button>
      </div>
    </div>
  );
}
