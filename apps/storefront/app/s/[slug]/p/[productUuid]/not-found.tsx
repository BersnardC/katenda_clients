"use client";

import { useI18n } from "@/lib/i18n";

export default function ProductNotFoundPage() {
  const { t } = useI18n();
  return (
    <main className="min-h-screen grid place-items-center p-8 text-center bg-background text-foreground">
      <div>
        <p className="text-muted-foreground mb-2">{t("product.notFound")}</p>
        <a href="/" className="text-primary font-medium">
          {t("product.backStore")}
        </a>
      </div>
    </main>
  );
}
