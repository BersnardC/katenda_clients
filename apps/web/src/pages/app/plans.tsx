import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Crown } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSubscription } from "@/hooks/useAccount";
import { accountService } from "@/services/accountService";
import type { Plan } from "@/types/models";

const FEATURE_KEYS = [
  {
    feature: "stores",
    one: "plans.featStoresOne",
    many: "plans.featStores",
    unlimited: "plans.featStoresUnlimited",
  },
  {
    feature: "users",
    one: "plans.featUsersOne",
    many: "plans.featUsers",
    unlimited: "plans.featUsersUnlimited",
  },
  {
    feature: "products",
    one: "plans.featProductsOne",
    many: "plans.featProducts",
    unlimited: "plans.featProductsUnlimited",
  },
  {
    feature: "categories",
    one: "plans.featCategoriesOne",
    many: "plans.featCategories",
    unlimited: "plans.featCategoriesUnlimited",
  },
  {
    feature: "roles",
    one: "plans.featRolesOne",
    many: "plans.featRoles",
    unlimited: "plans.featRolesUnlimited",
  },
  {
    feature: "orders_per_month",
    one: "plans.featOrdersOne",
    many: "plans.featOrders",
    unlimited: "plans.featOrdersUnlimited",
  },
  {
    feature: "media_per_product",
    one: "plans.featPhotosOne",
    many: "plans.featPhotos",
    unlimited: "plans.featPhotosUnlimited",
  },
] as const;

const ORDER: Record<string, number> = {
  starter: 0,
  business: 1,
  enterprise: 2,
};

export function Component() {
  const { t } = useI18n();
  const { data: subData } = useSubscription();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const currentPlanId = subData?.subscription?.plan_id;

  const decor: Record<string, string[]> = {
    starter: [t("plans.decorWhatsapp")],
    business: [t("plans.decorStats"), t("plans.decorSupport")],
    enterprise: [t("plans.decorApi"), t("plans.decorBrand")],
  };

  const sorted = [...plans].sort(
    (a, b) => (ORDER[a.slug] ?? 99) - (ORDER[b.slug] ?? 99),
  );

  /* Functions */
  const load = () => {
    accountService
      .plans()
      .then((res) => {
        setPlans(res.plans.filter((p) => Number(p.status) === 1));
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link
          to="/profile"
          className="size-10 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="font-display font-bold text-2xl">{t("plans.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("plans.sub")}</p>
        </div>
      </header>

      <div className="px-5 mt-4 space-y-4">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl p-5 border bg-card border-border shadow-soft space-y-3 animate-pulse"
            >
              <div className="flex items-baseline justify-between">
                <div className="h-7 w-28 rounded bg-muted" />
                <div className="h-9 w-20 rounded bg-muted" />
              </div>
              <div className="space-y-2">
                {[0, 1, 2].map((j) => (
                  <div key={j} className="h-4 w-3/4 rounded bg-muted" />
                ))}
              </div>
              <div className="h-11 w-full rounded-2xl bg-muted" />
            </div>
          ))}

        {!loading &&
          sorted.map((plan) => {
            const featured = plan.slug === "business";
            const isCurrent = plan.id === currentPlanId;
            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-5 border shadow-soft ${
                  featured
                    ? "gradient-brand text-primary-foreground border-transparent shadow-pop"
                    : "bg-card border-border"
                }`}
              >
                {featured && (
                  <span className="absolute -top-2 right-4 inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider">
                    <Crown className="size-3" /> {t("plans.popular")}
                  </span>
                )}
                {isCurrent && (
                  <span
                    className={`absolute -top-2 left-4 inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      featured
                        ? "bg-white text-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {t("plans.current")}
                  </span>
                )}
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display font-bold text-2xl">
                    {plan.name}
                  </h3>
                  <p className="font-display font-extrabold text-3xl">
                    ${plan.price}
                    <span className="text-sm font-medium opacity-70">
                      {t("plans.month")}
                    </span>
                  </p>
                </div>
                <ul className="mt-4 space-y-2">
                  {FEATURE_KEYS.map((f) => {
                    const limit = plan.limits?.find(
                      (l) => l.feature === f.feature,
                    )?.limit_value;
                    if (limit === undefined) return null;
                    const line =
                      limit === -1
                        ? t(f.unlimited)
                        : limit === 1
                          ? t(f.one)
                          : t(f.many).replace("{n}", String(limit));
                    return (
                      <li
                        key={f.feature}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check
                          className={`size-4 ${featured ? "" : "text-primary"}`}
                        />
                        {line}
                      </li>
                    );
                  })}
                  {decor[plan.slug]?.map((d) => (
                    <li
                      key={d}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Check
                        className={`size-4 ${featured ? "" : "text-primary"}`}
                      />
                      {d}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <span
                    className={`mt-5 w-full py-3 rounded-2xl font-semibold text-center block ${
                      featured
                        ? "bg-white/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {t("plans.current")}
                  </span>
                ) : (
                  <Link
                    to={`/pay-suscripcion?plan=${plan.slug}`}
                    className={`mt-5 w-full py-3 rounded-2xl font-semibold text-center block transition disabled:opacity-50 disabled:cursor-not-allowed ${
                      featured
                        ? "bg-white text-foreground dark:text-zinc-900"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {t("plans.choose")}
                  </Link>
                )}
              </div>
            );
          })}
      </div>
    </>
  );
}
