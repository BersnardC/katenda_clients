import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

export function Component() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display font-extrabold text-6xl text-primary">404</h1>
      <p className="mt-3 text-muted-foreground text-sm max-w-xs">
        {t("common.empty")}
      </p>
      <Link
        to="/"
        className="mt-8 px-6 py-3 rounded-2xl gradient-brand text-primary-foreground font-semibold shadow-pop"
      >
        {t("common.back")}
      </Link>
    </div>
  );
}
