import { Crown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@katenda_clients/ui/dialog";
import { useI18n } from "@/lib/i18n";

export function PlanLimitDialog({
  open,
  onOpenChange,
  feature,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
}) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <span className="size-14 grid place-items-center rounded-2xl gradient-brand shadow-pop text-primary-foreground">
            <Crown className="size-7" />
          </span>
          <DialogHeader>
            <DialogTitle className="text-xl">{t("plan.limitTitle")}</DialogTitle>
            <DialogDescription>
              {t("plan.limitSub").replace("{feature}", feature)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="w-full">
            <button
              onClick={() => onOpenChange(false)}
              className="w-full h-11 rounded-2xl gradient-brand text-primary-foreground font-semibold text-sm shadow-pop"
            >
              {t("plan.limitOk")}
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
