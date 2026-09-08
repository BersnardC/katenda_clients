"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Package,
  Receipt,
  ShoppingBag,
  Star,
  Store as StoreIcon,
  User,
  X,
} from "lucide-react";
import { useI18n, type Key } from "@/lib/i18n";
import { useCustomerAuth } from "@/lib/customerAuth";
import { useCart } from "@/lib/cart";
import { ACCENT_FALLBACK } from "@/lib/store";
import { clearCachedOrders } from "@/services/orderService";
import type { Store, StorefrontAccount } from "@/types/models";

type AccountShellCtx = {
  store: Store;
  account: StorefrontAccount | null;
  slug: string;
  accent: string;
  primaryCurrency: string;
  secondaryCurrency: { code: string } | null;
  waPhone: string;
};

const AccountShellContext = createContext<AccountShellCtx | null>(null);

export function useAccountShell() {
  const ctx = useContext(AccountShellContext);
  if (!ctx) throw new Error("useAccountShell must be used inside AccountShell");
  return ctx;
}

function titleKey(pathname: string): Key {
  if (pathname.startsWith("/account/orders/")) return "order.detail";
  if (pathname === "/account" || pathname.startsWith("/account/orders")) {
    return "order.title";
  }
  if (pathname.startsWith("/account/profile")) return "profile.title";
  if (pathname.startsWith("/account/addresses")) return "address.title";
  if (pathname.startsWith("/account/payments")) return "payment.title";
  if (pathname.startsWith("/account/reviews")) return "review.title";
  return "account.title";
}

export function AccountShell({
  store,
  account,
  slug,
  children,
}: {
  store: Store;
  account: StorefrontAccount | null;
  slug: string;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const { customer, loading, logout } = useCustomerAuth();
  const { clear } = useCart();
  const [menu, setMenu] = useState(false);

  const accent = store.accent_color ?? ACCENT_FALLBACK;
  const primaryCurrency = store.currency?.code ?? "USD";
  const secondaryCurrency = store.currency_secondary ?? null;
  const waPhone =
    store.contacts?.find((c) => c.type === "whatsapp")?.value ??
    account?.phone ??
    "";

  const value = useMemo(
    () => ({
      store,
      account,
      slug,
      accent,
      primaryCurrency,
      secondaryCurrency,
      waPhone,
    }),
    [store, account, slug, accent, primaryCurrency, secondaryCurrency, waPhone],
  );

  const handleLogout = async () => {
    await logout();
    clear();
    clearCachedOrders(slug);
    router.replace("/");
  };

  const bottomLinks = [
    {
      href: "/account/orders",
      label: "account.orders" as Key,
      icon: Package,
      active: (p: string) =>
        p === "/account" || p.startsWith("/account/orders"),
    },
    {
      href: "/account/profile",
      label: "account.profile" as Key,
      icon: User,
      active: (p: string) => p.startsWith("/account/profile"),
    },
    {
      href: "/account/reviews",
      label: "account.reviews" as Key,
      icon: Star,
      active: (p: string) => p.startsWith("/account/reviews"),
    },
  ];

  const menuLinks = [
    { href: "/account/orders", label: "account.orders" as Key, icon: Package },
    { href: "/account/profile", label: "account.profile" as Key, icon: User },
    {
      href: "/account/addresses",
      label: "account.addresses" as Key,
      icon: MapPin,
    },
    {
      href: "/account/payments",
      label: "account.payments" as Key,
      icon: Receipt,
    },
    { href: "/account/reviews", label: "account.reviews" as Key, icon: Star },
    { href: "/", label: "account.keepShopping" as Key, icon: StoreIcon },
  ];

  return (
    <AccountShellContext.Provider value={value}>
      <div className="min-h-screen bg-background text-foreground">
        <nav className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur border-b border-border print:hidden">
          <div className="mx-auto w-full max-w-3xl px-4 md:px-8 h-14 flex items-center gap-3">
            <Link
              href="/"
              className="size-9 grid place-items-center rounded-full bg-surface border border-border"
              aria-label={t("account.back")}
            >
              <ArrowLeft className="size-4" />
            </Link>
            <span className="font-display font-extrabold tracking-tight truncate">
              {t(titleKey(pathname))}
            </span>
            {customer && (
              <button
                onClick={handleLogout}
                className="ml-auto flex items-center gap-2 px-3 h-9 rounded-full bg-surface border border-border text-sm font-medium"
              >
                <LogOut className="size-4" /> {t("account.logout")}
              </button>
            )}
          </div>
        </nav>

        <main className="mx-auto w-full max-w-3xl px-4 md:px-8 py-6 pb-28">
          {loading ? (
            <div className="py-24 grid place-items-center">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : !customer ? (
            <AuthCard storeName={store.name} accent={accent} />
          ) : (
            children
          )}
        </main>

        {customer && (
          <>
            <nav className="fixed bottom-0 inset-x-0 z-40 print:hidden">
              <div className="mx-auto max-w-3xl px-3 pb-3">
                <ul className="flex items-center justify-around rounded-3xl bg-card/95 backdrop-blur border border-border shadow-soft px-2 py-2">
                  {bottomLinks.map((l) => {
                    const on = l.active(pathname);
                    return (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition"
                          style={{ color: on ? accent : undefined }}
                        >
                          <l.icon
                            className={`size-5 ${on ? "" : "text-muted-foreground"}`}
                          />
                          <span
                            className={`text-[10px] font-medium ${on ? "" : "text-muted-foreground"}`}
                          >
                            {t(l.label)}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                  <li>
                    <button
                      onClick={() => setMenu(true)}
                      className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-muted-foreground"
                      aria-label={t("account.openMenu")}
                    >
                      <Menu className="size-5" />
                      <span className="text-[10px] font-medium">
                        {t("account.menu")}
                      </span>
                    </button>
                  </li>
                </ul>
              </div>
            </nav>

            {menu && (
              <>
                <div
                  className="fixed inset-0 z-50 bg-black/50 animate-in fade-in print:hidden"
                  onClick={() => setMenu(false)}
                />
                <aside className="fixed right-0 top-0 bottom-0 z-50 w-[86%] max-w-xs bg-background border-l border-border p-5 print:hidden overflow-y-auto animate-in slide-in-from-right duration-300">
                  <div className="flex items-center justify-between">
                    <p className="font-display font-extrabold text-lg">
                      {t("account.title")}
                    </p>
                    <button
                      onClick={() => setMenu(false)}
                      className="size-9 grid place-items-center rounded-full bg-surface border border-border"
                      aria-label={t("account.closeMenu")}
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div
                      className="size-11 rounded-2xl grid place-items-center text-white font-display font-extrabold"
                      style={{ backgroundColor: accent }}
                    >
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{customer.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {customer.email}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-5 space-y-1">
                    {menuLinks.map((l) => (
                      <li key={l.href + l.label}>
                        <Link
                          href={l.href}
                          onClick={() => setMenu(false)}
                          className="flex items-center gap-3 px-3 h-12 rounded-2xl hover:bg-muted transition text-sm font-medium"
                        >
                          <l.icon className="size-5 text-muted-foreground" />{" "}
                          {t(l.label)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      setMenu(false);
                      handleLogout();
                    }}
                    className="mt-5 w-full h-12 rounded-2xl bg-surface border border-border text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <LogOut className="size-4" /> {t("account.logout")}
                  </button>
                </aside>
              </>
            )}
          </>
        )}
      </div>
    </AccountShellContext.Provider>
  );
}

function AuthCard({
  storeName,
  accent,
}: {
  storeName: string;
  accent: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const { login, register } = useCustomerAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [whatsapp, setWhatsapp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError("Completa correo y contraseña.");
      return;
    }
    if (mode === "register" && !whatsapp.trim()) {
      setError("Escribe tu WhatsApp.");
      return;
    }
    if (mode === "register" && !name.trim()) {
      setError("Escribe tu nombre.");
      return;
    }
    if (mode === "register" && password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
      } else {
        await register({
          whatsapp: whatsapp.trim(),
          name: name.trim(),
          email: email.trim(),
          password,
          password_confirmation: confirm,
        });
      }
      // Al autenticarse vuelve al flujo de compra (si venía del carrito).
      router.replace("/");
    } catch (e) {
      const message =
        e && typeof e === "object" && "message" in e
          ? String((e as { message?: string }).message ?? "")
          : "";
      setError(message || "No se pudo iniciar sesión.");
    } finally {
      setSubmitting(false);
    }
  };

  const title =
    mode === "login" ? t("account.login") : t("account.register");
  const sub =
    mode === "login"
      ? t("account.loginSub", { store: storeName })
      : t("account.registerSub", { store: storeName });

  return (
    <div className="mx-auto max-w-md">
      <div className="text-center">
        <div
          className="mx-auto size-14 rounded-2xl grid place-items-center text-white"
          style={{ backgroundColor: accent }}
        >
          <ShoppingBag className="size-6" />
        </div>
        <h1 className="mt-3 font-display font-extrabold text-2xl tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{sub}</p>
      </div>

      <div className="mt-5 rounded-3xl bg-card border border-border p-5 shadow-soft space-y-3">
        {mode === "register" && (
          <IconField
            icon={<MessageCircle className="size-4 text-muted-foreground" />}
            value={whatsapp}
            onChange={setWhatsapp}
            placeholder={t("account.whatsappPh")}
          />
        )}
        {mode === "register" && (
          <IconField
            icon={<User className="size-4 text-muted-foreground" />}
            value={name}
            onChange={setName}
            placeholder={t("account.namePh")}
          />
        )}
        <IconField
          icon={<Mail className="size-4 text-muted-foreground" />}
          value={email}
          onChange={setEmail}
          type="email"
          placeholder={t("account.emailPh")}
        />
        <IconField
          icon={<Lock className="size-4 text-muted-foreground" />}
          value={password}
          onChange={setPassword}
          type="password"
          placeholder={t("account.passwordPh")}
        />
        {mode === "register" && (
          <IconField
            icon={<Lock className="size-4 text-muted-foreground" />}
            value={confirm}
            onChange={setConfirm}
            type="password"
            placeholder={t("account.confirmPh")}
          />
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          onClick={submit}
          disabled={submitting}
          className="w-full h-12 rounded-2xl text-white font-semibold disabled:opacity-60"
          style={{ backgroundColor: accent }}
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin mx-auto" />
          ) : mode === "login" ? (
            t("account.submitLogin")
          ) : (
            t("account.submitRegister")
          )}
        </button>

        <button
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError(null);
          }}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition"
        >
          {mode === "login"
            ? t("account.toggleRegister")
            : t("account.toggleLogin")}
        </button>
      </div>
    </div>
  );
}

function IconField({
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex items-center gap-2 px-4 h-12 rounded-2xl bg-surface border border-border">
      {icon}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm"
      />
    </div>
  );
}
