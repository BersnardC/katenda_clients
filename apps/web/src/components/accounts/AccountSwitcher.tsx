import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, ChevronDown, Building2, Store as StoreIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/lib/i18n";

/**
 * Cambio de cuenta/tienda de operación (multi-membresía).
 *
 * El backend resuelve el tenant desde users.active_account_id (cuenta de
 * operación por defecto). Al cambiar se llama POST /account/switch y se
 * actualiza el user en AuthContext; el layout remonta el subtree por
 * active_account_id, así las páginas refrescan datos del nuevo tenant.
 */

function useAccountNavigation() {
  const { switchAccount } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const select = async (accountId: number) => {
    await switchAccount(accountId);
    if (pathname !== "/dashboard") {
      navigate("/dashboard");
    }
  };

  return { select };
}

/** Chip compacto (dashboard): nombre de la cuenta actual + menú de cuentas. */
export function AccountSwitcherChip() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { select } = useAccountNavigation();
  const [open, setOpen] = useState(false);

  const accounts = user?.accounts ?? [];
  if (accounts.length <= 1) return null;

  const active = accounts.find((a) => a.is_active);
  const label = user?.activeAccount?.name ?? active?.name ?? user?.name ?? "";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 h-11 pl-3 pr-2 rounded-2xl bg-surface border border-border text-sm max-w-[180px]"
        title={t("accounts.switch")}
      >
        <Building2 className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate font-medium">{label}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="close"
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border bg-card shadow-soft overflow-hidden z-40">
            <ul className="py-1">
              {accounts.map((account) => (
                <li key={account.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      void select(account.id);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted"
                  >
                    <span className="size-9 shrink-0 grid place-items-center rounded-xl bg-primary/10 text-primary">
                      <StoreIcon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-sm truncate">
                        {account.name}
                      </span>
                      {account.role && (
                        <span className="block text-xs text-muted-foreground capitalize">
                          {account.role}
                        </span>
                      )}
                    </span>
                    {account.is_active && (
                      <Check className="size-4 text-primary shrink-0" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

/** Lista de cuentas con cambio inline (perfil / settings). */
export function MemberAccountRows() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { select } = useAccountNavigation();

  const accounts = user?.accounts ?? [];
  if (accounts.length === 0) return null;

  return (
    <ul className="space-y-2">
      {accounts.map((account) => (
        <li key={account.id}>
          <button
            type="button"
            onClick={() => void select(account.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition ${
              account.is_active
                ? "bg-primary/10 border-primary/30"
                : "bg-card border-border hover:bg-muted"
            }`}
          >
            <span className="size-10 shrink-0 grid place-items-center rounded-xl bg-primary/10 text-primary">
              <StoreIcon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-sm truncate">
                {account.name}
              </span>
              {account.role && (
                <span className="block text-xs text-muted-foreground capitalize">
                  {account.role}
                </span>
              )}
            </span>
            {account.is_active && (
              <span className="text-xs font-medium text-primary shrink-0">
                {t("accounts.active")}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
