import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="size-20 rounded-3xl gradient-brand grid place-items-center shadow-pop">
        <Sparkles className="size-9 text-primary-foreground" />
      </div>
      <h1 className="mt-6 font-display font-bold text-2xl">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs">
        {description ?? t("common.comingSoon")}
      </p>
      <Link
        to="/dashboard"
        className="mt-8 px-6 py-3 rounded-2xl border border-border bg-surface-elevated/60 backdrop-blur font-medium text-sm"
      >
        {t("common.back")}
      </Link>
    </div>
  );
}
