import { Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function ItemsPaginator({
  loaded,
  total,
  hasMore,
  loadingMore,
  onLoadMore,
  showIndicators = false,
}: {
  loaded: number;
  total: number;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  showIndicators?: boolean;
}) {
  const { t } = useI18n();

  return (
    <div className="px-5 py-4 flex items-center justify-center gap-3">
      {showIndicators && (
        <span className="text-xs font-semibold text-muted-foreground tabular-nums">
          {t("common.loadedOf")
            .replace("{loaded}", String(loaded))
            .replace("{total}", String(total))}
        </span>
      )}
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={loadingMore}
          className="flex items-center gap-1.5 px-4 h-9 rounded-full bg-muted text-foreground text-xs font-semibold disabled:opacity-60"
        >
          {loadingMore && <Loader2 className="size-3.5 animate-spin" />}
          {loadingMore ? t("common.loading") : t("common.loadMore")}
        </button>
      )}
    </div>
  );
}
