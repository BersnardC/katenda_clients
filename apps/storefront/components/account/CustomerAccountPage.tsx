"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Package,
  ShoppingBag,
  User as UserIcon,
} from "lucide-react";
import { useI18n, type Key } from "@/lib/i18n";
import { useCustomerAuth, type CustomerOrder } from "@/lib/customerAuth";
import { useCart } from "@/lib/cart";
import {
  clearCachedOrders,
  fetchMyOrders,
  readCachedOrders,
  saveCachedOrders,
} from "@/services/orderService";
import { fmtIsoDate } from "@/lib/format";

const STATUS_KEYS: Record<string, Key> = {
  pending: "order.status.pending",
  confirmed: "order.status.confirmed",
  preparing: "order.status.preparing",
  shipped: "order.status.shipped",
  delivered: "order.status.delivered",
  cancelled: "order.status.cancelled",
};

export function CustomerAccountPage({
  storeName,
  slug,
}: {
  storeName: string;
  slug: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const { customer, loading, logout } = useCustomerAuth();
  const { clear: clearCart } = useCart();

  const handleLogout = async () => {
    await logout();
    clearCart();
    clearCachedOrders(slug);
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground grid place-items-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur border-b border-border">
        <div className="mx-auto w-full max-w-3xl px-4 md:px-8 h-14 flex items-center gap-3">
          <Link
            href="/"
            className="size-9 grid place-items-center rounded-full bg-surface border border-border"
            aria-label={t("store.backStore")}
          >
            <ArrowLeft className="size-4" />
          </Link>
          <span className="font-display font-extrabold tracking-tight truncate">
            {t("cuenta.title")}
          </span>
          {customer && (
            <button
              onClick={handleLogout}
              className="ml-auto flex items-center gap-2 px-3 h-9 rounded-full bg-surface border border-border text-sm font-medium"
            >
              <LogOut className="size-4" /> {t("store.logout")}
            </button>
          )}
        </div>
      </nav>

      <main className="mx-auto w-full max-w-3xl px-4 md:px-8 py-6">
        {customer ? (
          <AccountBody customer={customer} slug={slug} />
        ) : (
          <AuthCard storeName={storeName} />
        )}
      </main>
    </div>
  );
}

function AccountBody({ customer, slug }: { customer: import("@/lib/customerAuth").Customer; slug: string }) {
  const { t } = useI18n();
  // Primer pintado instantáneo desde el caché local (si existe); el fetch de
  // siempre se hace igual al montar pero en silencio, sin el loader grande.
  const [orders, setOrders] = useState<CustomerOrder[]>(
    () => readCachedOrders(slug) ?? [],
  );
  const [hasCache] = useState(() => readCachedOrders(slug) !== null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadOrders = async () => {
    if (ordersLoading || loaded) return;
    setOrdersLoading(true);
    try {
      const fresh = await fetchMyOrders(slug);
      setOrders(fresh);
      saveCachedOrders(slug, fresh);
    } catch {
      // no auth / error → mantener lo cacheado en pantalla
    } finally {
      setOrdersLoading(false);
      setLoaded(true);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return (
    <>
      <header className="flex items-center gap-3">
        <div className="size-14 rounded-2xl grid place-items-center text-white font-display font-extrabold text-xl bg-primary">
          {customer.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="font-display font-extrabold text-2xl tracking-tight truncate">
            {t("cuenta.hello", { name: customer.name.split(" ")[0] })}
          </h1>
          <p className="text-sm text-muted-foreground truncate">{customer.email}</p>
        </div>
      </header>

      <div className="mt-5">
        <span className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full text-sm font-medium bg-primary text-primary-foreground">
          <Package className="size-4" /> {t("cuenta.tabOrders")}
        </span>
      </div>

      <div className="mt-5">
        {ordersLoading && orders.length === 0 && !hasCache ? (
          <div className="py-16 text-center text-muted-foreground">
            <Loader2 className="size-8 mx-auto mb-3 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState text={t("cuenta.ordersEmpty")} />
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <OrderCard key={o.uuid} order={o} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function OrderCard({ order }: { order: CustomerOrder }) {
  const { t } = useI18n();
  const statusLabel = t(STATUS_KEYS[order.status] ?? "order.status.pending");
  return (
    <article className="rounded-3xl bg-card border border-border p-4 shadow-soft">
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold">{order.code}</p>
        <span className="px-2.5 h-7 grid place-items-center rounded-full text-xs font-semibold text-white capitalize bg-primary">
          {statusLabel}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-0.5">{fmtIsoDate(order.created_at)}</p>
      <ul className="mt-3 space-y-1 text-sm">
        {(order.items ?? []).map((i) => (
          <li key={i.id} className="flex justify-between gap-3">
            <span className="truncate">
              {i.qty}× {i.name}
            </span>
            <span className="tabular-nums">${(Number(i.price) * i.qty).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between font-display font-bold">
        <span>{t("cuenta.total")}</span>
        <span className="text-primary">
          ${Number(order.total).toFixed(2)}
        </span>
      </div>
    </article>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-16 text-center text-muted-foreground">
      <ShoppingBag className="size-10 mx-auto mb-3 opacity-50" />
      <p>{text}</p>
    </div>
  );
}

function AuthCard({ storeName }: { storeName: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const { login, register } = useCustomerAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
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
    mode === "login" ? t("cuenta.login") : t("cuenta.register");
  const sub =
    mode === "login"
      ? t("cuenta.loginSub", { store: storeName })
      : t("cuenta.registerSub", { store: storeName });

  return (
    <div className="mx-auto max-w-md">
      <div className="text-center">
        <div className="mx-auto size-14 rounded-2xl grid place-items-center text-white bg-primary">
          <ShoppingBag className="size-6" />
        </div>
        <h1 className="mt-3 font-display font-extrabold text-2xl tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{sub}</p>
      </div>

      <div className="mt-5 rounded-3xl bg-card border border-border p-5 shadow-soft space-y-3">
        {mode === "register" && (
          <IconField
            icon={<UserIcon className="size-4 text-muted-foreground" />}
            value={name}
            onChange={setName}
            placeholder={t("cuenta.namePh")}
          />
        )}
        <IconField
          icon={<Mail className="size-4 text-muted-foreground" />}
          value={email}
          onChange={setEmail}
          type="email"
          placeholder={t("cuenta.emailPh")}
        />
        <IconField
          icon={<Lock className="size-4 text-muted-foreground" />}
          value={password}
          onChange={setPassword}
          type="password"
          placeholder={t("cuenta.passwordPh")}
        />
        {mode === "register" && (
          <IconField
            icon={<Lock className="size-4 text-muted-foreground" />}
            value={confirm}
            onChange={setConfirm}
            type="password"
            placeholder={t("cuenta.passwordPh")}
          />
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          onClick={submit}
          disabled={submitting}
          className="w-full h-12 rounded-2xl text-white font-semibold bg-primary disabled:opacity-60"
        >
          {submitting
            ? <Loader2 className="size-4 animate-spin mx-auto" />
            : mode === "login"
              ? t("cuenta.submitLogin")
              : t("cuenta.submitRegister")}
        </button>

        <button
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError(null);
          }}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition"
        >
          {mode === "login" ? t("cuenta.toggleRegister") : t("cuenta.toggleLogin")}
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
