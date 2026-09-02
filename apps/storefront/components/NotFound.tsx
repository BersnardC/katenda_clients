"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export function NotFound() {
  const { t } = useI18n();
  return (
    <main className="min-h-screen grid place-items-center p-8 text-center bg-background text-foreground">
      <div>
        <p className="text-muted-foreground mb-2">{t("notFound.title")}</p>
        <p className="text-sm text-muted-foreground mb-6">{t("notFound.sub")}</p>
        <Link
          href="/"
          className="inline-flex items-center px-5 h-11 rounded-2xl gradient-brand text-primary-foreground font-semibold shadow-pop"
        >
          {t("notFound.home")}
        </Link>
      </div>
    </main>
  );
}
