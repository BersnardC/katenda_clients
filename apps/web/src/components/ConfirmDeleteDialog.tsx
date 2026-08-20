import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@katenda_clients/ui/alert-dialog";
import { useI18n } from "@/lib/i18n";

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
}) {
  const { t } = useI18n();
  const [pending, setPending] = useState(false);

  const handleOpenChange = (o: boolean) => {
    if (pending && !o) return;
    onOpenChange(o);
  };

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    try {
      await onConfirm();
    } finally {
      setPending(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={pending}
            className="bg-destructive text-destructive-foreground"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              (confirmLabel ?? t("common.delete"))
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
