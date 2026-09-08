"use client";

import { Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { EmptyState } from "@/components/account/accountUi";

export function ReviewsPage() {
  const { t } = useI18n();

  return (
    <>
      <h1 className="font-display font-extrabold text-2xl tracking-tight">
        {t("review.title")}
      </h1>
      <p className="text-sm text-muted-foreground">{t("review.subtitle")}</p>
      <div className="mt-5">
        <EmptyState icon={Star} text={t("review.comingSoon")} />
      </div>
    </>
  );
}
