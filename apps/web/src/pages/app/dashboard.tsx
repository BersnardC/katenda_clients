import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  Copy,
  Crown,
  CreditCard,
  Eye,
  ExternalLink,
  MessageCircle,
  Package,
  Plus,
  BarChart3,
  Rocket,
  ShoppingBag,
  Store as StoreIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useI18n } from "@/lib/i18n";
import { STORE_PUBLIC_URL } from "@/lib/store";
import { storeBrand } from "@/lib/storeBrand";
import { accountService } from "@/services/accountService";
import { AccountSwitcherChip } from "@/components/accounts/AccountSwitcher";
import type { AccountStats } from "@/types/models";

export function Component() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { account, stores: contextStores, storesLoading } = useApp();
  const { stores, totalStores, loading } = useDashboardStats(contextStores, storesLoading);
  const [stats, setStats] = useState<Partial<AccountStats> | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    accountService
      .stats("visits_count,orders_count,products_count")
      .then((res) => setStats(res.stats))
      .catch(() => undefined)
      .finally(() => setStatsLoading(false));
  }, []);

  const copyStoreUrl = (slug: string) => {
    navigator.clipboard.writeText(STORE_PUBLIC_URL(slug));
    toast.success(t("common.copied"));
  };

  return (
    <>
      <header className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {t("home.greeting")} 👋
          </p>
          <h1 className="font-display font-bold text-2xl">{user?.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <AccountSwitcherChip />
          <Link
            to="/profile"
            className="relative size-11 rounded-2xl bg-surface border border-border grid place-items-center"
            aria-label={t("nav.profile")}
          >
            <Bell className="size-5" />
          </Link>
        </div>
      </header>

      <section className="mx-5 rounded-3xl p-5 gradient-brand text-primary-foreground shadow-pop">
        <p className="text-sm opacity-80">{t("home.today")}</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <Stat
            icon={<Eye className="size-4" />}
            label={t("dashboard.visits")}
            value={statsLoading ? "…" : String(stats?.visits_count ?? 0)}
          />
          <Stat
            icon={<ShoppingBag className="size-4" />}
            label={t("dashboard.orders")}
            value={statsLoading ? "…" : String(stats?.orders_count ?? 0)}
          />
          <Stat
            icon={<Package className="size-4" />}
            label={t("dashboard.products")}
            value={statsLoading ? "…" : String(stats?.products_count ?? 0)}
          />
        </div>
      </section>

      {account && !account.onboarded && (
        <Link
          to="/start"
          className="mx-5 mt-4 mb-2 flex items-center gap-3 p-4 rounded-2xl bg-card border border-primary/30 shadow-soft"
        >
          <span className="size-11 shrink-0 grid place-items-center rounded-xl gradient-brand text-primary-foreground">
            <Rocket className="size-5" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-display font-bold">
              {t("onboarding.bannerTitle")}
            </span>
            <span className="block text-xs text-muted-foreground">
              {t("onboarding.bannerSubtitle")}
            </span>
          </span>
          <ArrowRight className="size-5 text-primary" />
        </Link>
      )}

      <section className="px-5 mt-6">
        <h2 className="font-display font-bold text-lg mb-3">
          {t("home.quick")}
        </h2>
        <div className="grid grid-cols-4 gap-3">
          <Quick to="/products/new" icon={<Plus />} label={t("nav.publish")} />
          <Quick
            to="/products"
            icon={<Package />}
            label={t("dashboard.products")}
          />
          <Quick
            to="/stores"
            icon={<StoreIcon />}
            label={t("nav.mystore")}
          />
          <Quick
            to="/whatsapp"
            icon={<MessageCircle />}
            label={t("wa.title")}
          />
          <Quick to="/admin" icon={<BarChart3 />} label={t("admin.title")} />
          <Quick to="/payments" icon={<CreditCard />} label={t("pay.title")} />
          <Quick
            to="/pay-suscripcion"
            icon={<Crown />}
            label={t("paySuscripcion.title")}
          />
        </div>
      </section>

      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-lg">
            {t("home.myStores")} · {totalStores}
          </h2>
          <Link to="/stores" className="text-sm text-primary font-medium">
            {t("home.viewAll")}
          </Link>
        </div>
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <StoreCardSkeleton key={i} />
            ))
          ) : stores.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground rounded-3xl bg-card border border-border">
              {t("stores.empty")}
            </div>
          ) : (
            stores.map((s) => {
              const brand = storeBrand(s.slug);
              const storeUrl = STORE_PUBLIC_URL(s.slug);
              return (
                <div
                  key={s.uuid}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border shadow-soft"
                >
                  <div
                    className="size-14 rounded-2xl grid place-items-center text-2xl shrink-0"
                    style={{ backgroundColor: brand.color + "33" }}
                  >
                    <span>{brand.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {storeUrl}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => window.open(storeUrl, "_blank")}
                      className="size-9 grid place-items-center rounded-xl hover:bg-surface text-muted-foreground hover:text-foreground transition cursor-pointer"
                      aria-label={t("dashboard.visitStore")}
                    >
                      <ExternalLink className="size-4" />
                    </button>
                    <button
                      onClick={() => copyStoreUrl(s.slug)}
                      className="size-9 grid place-items-center rounded-xl hover:bg-surface text-muted-foreground hover:text-foreground transition cursor-pointer"
                      aria-label={t("common.copy")}
                    >
                      <Copy className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/15 backdrop-blur p-3">
      <div className="opacity-80">{icon}</div>
      <p className="mt-1 font-display font-extrabold text-2xl">{value}</p>
      <p className="text-[11px] opacity-80">{label}</p>
    </div>
  );
}

function Quick({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card border border-border shadow-soft active:scale-95 transition"
    >
      <span className="size-10 grid place-items-center rounded-xl bg-primary/15 text-primary">
        {icon}
      </span>
      <span className="text-[11px] font-medium text-center leading-tight">
        {label}
      </span>
    </Link>
  );
}

function StoreCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
      <div className="size-14 rounded-2xl bg-muted animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
        <div className="h-3 w-1/3 bg-muted rounded animate-pulse" />
      </div>
      <div className="h-3 w-10 bg-muted rounded animate-pulse" />
    </div>
  );
}
