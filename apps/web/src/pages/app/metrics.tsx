import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  ShoppingBag,
  TrendingUp,
  Users,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { accountService } from "@/services/accountService";
import { StatusBadge } from "@/components/orders/StatusBadge";
import type { AccountStats, CategorySale, RevenuePoint } from "@/types/models";

type Range = "7d" | "30d" | "90d";

const PALETTE = ["#12B886", "#0EA5E9", "#F59E0B", "#8B5CF6", "#EF4444", "#64748B"];

const money = (v: number) => `$${v.toFixed(2)}`;

export function Component() {
  const { t } = useI18n();
  const [stats, setStats] = useState<Partial<AccountStats> | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>("7d");
  const [series, setSeries] = useState<RevenuePoint[]>([]);

  useEffect(() => {
    accountService
      .stats()
      .then((res) => setStats(res.stats))
      .catch(() => toast.error(t("metrics.loadError")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    accountService
      .statsRevenue(range)
      .then((res) => setSeries(res.revenue_series))
      .catch(() => setSeries([]));
  }, [range]);

  const rangeTotal = useMemo(
    () => series.reduce((acc, p) => acc + p.total, 0),
    [series],
  );

  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link
          to="/dashboard"
          className="size-10 grid place-items-center rounded-full bg-surface border border-border"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-display font-bold text-2xl">{t("admin.title")}</h1>
      </header>

      <div className="px-5 grid grid-cols-2 gap-3 mt-2">
        <KPI
          icon={<Eye className="size-4" />}
          label={t("dashboard.visits")}
          value={String(stats?.visits_count ?? 0)}
        />
        <KPI
          icon={<ShoppingBag className="size-4" />}
          label={t("dashboard.orders")}
          value={String(stats?.orders_count ?? 0)}
        />
        <KPI
          icon={<Users className="size-4" />}
          label={t("customers.title")}
          value={String(stats?.customers_count ?? 0)}
        />
        <KPI
          icon={<TrendingUp className="size-4" />}
          label={t("metrics.revenue")}
          value={money(stats?.revenue ?? 0)}
        />
      </div>

      <section className="px-5 mt-6">
        <div className="rounded-3xl bg-card border border-border p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("metrics.income")}
              </p>
              <p className="font-display font-extrabold text-3xl mt-1">
                {money(rangeTotal)}
              </p>
            </div>
            <div className="flex bg-surface rounded-full p-1 text-xs font-semibold">
              {(["7d", "30d", "90d"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1 rounded-full ${
                    range === r
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <LineChart data={series} />
        </div>
      </section>

      <section className="px-5 mt-5">
        <div className="rounded-3xl bg-card border border-border p-5 shadow-soft">
          <p className="font-display font-bold text-lg mb-3">
            {t("metrics.byCategory")}
          </p>
          {(stats?.sales_by_category ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("metrics.empty")}</p>
          ) : (
            <div className="flex items-center gap-5">
              <Donut data={stats?.sales_by_category ?? []} />
              <ul className="flex-1 space-y-1.5">
                {(stats?.sales_by_category ?? []).map((c, i) => (
                  <li key={c.name} className="flex items-center gap-2 text-xs">
                    <span
                      className="size-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                    />
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="font-semibold">{c.percent}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {(stats?.low_stock ?? []).length > 0 && (
        <section className="px-5 mt-5">
          <div className="rounded-3xl bg-warning/15 border border-warning/40 p-4">
            <p className="font-display font-bold text-sm flex items-center gap-2 text-warning-foreground">
              <AlertTriangle className="size-4" /> {t("metrics.lowStock")}
            </p>
            <ul className="mt-2 space-y-1">
              {(stats?.low_stock ?? []).map((p) => (
                <li
                  key={p.uuid}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate">{p.name}</span>
                  <span className="font-semibold text-warning-foreground">
                    {p.stock} ud
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="px-5 mt-5 mb-2">
        <h2 className="font-display font-bold text-lg mb-3">
          {t("metrics.recent")}
        </h2>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-2xl bg-card border border-border animate-pulse"
              />
            ))}
          </div>
        ) : (stats?.recent_orders ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("metrics.empty")}</p>
        ) : (
          <ul className="space-y-2">
            {(stats?.recent_orders ?? []).map((o) => (
              <li
                key={o.uuid}
                className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border"
              >
                <div className="size-10 rounded-xl bg-primary/15 text-primary grid place-items-center font-semibold text-sm">
                  {initials(o.customer_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {o.customer_name ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.created_at
                      ? new Date(o.created_at).toLocaleDateString()
                      : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">${Number(o.total).toFixed(2)}</p>
                  <StatusBadge status={o.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function KPI({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 shadow-soft">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="font-display font-extrabold text-2xl mt-1">{value}</p>
    </div>
  );
}

function LineChart({ data }: { data: RevenuePoint[] }) {
  const w = 300;
  const h = 120;
  const pad = 8;
  const max = Math.max(...data.map((d) => d.total), 1);
  const step = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;

  const pts = data.map((d, i) => {
    const x = pad + i * step;
    const y = h - pad - (d.total / max) * (h - pad * 2);
    return `${x},${y}`;
  });

  const line = pts.join(" ");
  const area = `${pad},${h - pad} ${line} ${w - pad},${h - pad}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-32 mt-4"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12B886" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#12B886" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#chartFill)" />
      <polyline
        points={line}
        fill="none"
        stroke="#12B886"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Donut({ data }: { data: CategorySale[] }) {
  const total = data.reduce((acc, c) => acc + c.total, 0) || 1;
  const segments = buildSegments(data, total);

  return (
    <div
      className="relative size-24 rounded-full shrink-0"
      style={{ background: `conic-gradient(${segments})` }}
    >
      <div className="absolute inset-[18px] rounded-full bg-card" />
    </div>
  );
}

function buildSegments(data: CategorySale[], total: number): string {
  let acc = 0;
  const segs: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const c = data[i];
    const start = (acc / total) * 100;
    acc += c.total;
    const end = (acc / total) * 100;
    segs.push(`${PALETTE[i % PALETTE.length]} ${start}% ${end}%`);
  }

  return segs.join(", ");
}

function initials(name: string | null): string {
  if (!name) return "—";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
