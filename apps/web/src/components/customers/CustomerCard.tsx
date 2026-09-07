import { Link } from "react-router-dom";
import { ChevronRight, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { fmtCurrency } from "@/lib/currency";
import { CUSTOMER_TAGS, segmentFor, formatDate } from "@/lib/customers";
import type { Customer } from "@/types/models";

export function CustomerCard({
  customer,
  primaryCurrency,
  secondaryCurrency,
}: {
  customer: Customer;
  primaryCurrency: string;
  secondaryCurrency: string | null;
}) {
  const { t, lang } = useI18n();
  const tag = CUSTOMER_TAGS[segmentFor(customer.orders_count)];
  const initial = customer.name.trim().charAt(0).toUpperCase();

  return (
    <li>
      <Link
        to={`/customers/${customer.uuid}`}
        className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border shadow-soft active:scale-[0.99] transition"
      >
        <div className="size-12 shrink-0 rounded-full grid place-items-center text-lg font-bold bg-primary/15 text-primary">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm truncate">{customer.name}</p>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
              style={{ backgroundColor: tag.color + "33", color: tag.color }}
            >
              {tag.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {customer.email}
          </p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="size-3" /> {customer.city ?? "—"} ·{" "}
            {customer.orders_count} {t("customers.orders")}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-display font-extrabold">
            {fmtCurrency(customer.total_spent, primaryCurrency)}
          </p>
          {secondaryCurrency && (
            <p className="text-[11px] text-muted-foreground tabular-nums">
              ≈ {fmtCurrency(customer.total_spent, secondaryCurrency)}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground">
            {t("customers.since")} {formatDate(customer.member_since, lang)}
          </p>
        </div>
        <ChevronRight className="size-4 text-muted-foreground shrink-0" />
      </Link>
    </li>
  );
}
