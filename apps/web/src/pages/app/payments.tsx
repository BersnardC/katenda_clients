import { PlaceholderPage } from "@/components/PlaceholderPage";
import { useI18n } from "@/lib/i18n";

export function Component() {
  const { t } = useI18n();
  return <PlaceholderPage title={t("pay.title")} />;
}
