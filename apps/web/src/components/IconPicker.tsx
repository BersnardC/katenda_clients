import { useMemo, useState } from "react";
import { icons, Tag, Search, X } from "lucide-react";
import type { LucideProps } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@katenda_clients/ui/dialog";
import { useI18n } from "@/lib/i18n";

const ICON_NAMES = Object.keys(icons);

export function DynamicIcon({
  name,
  className,
  ...props
}: Omit<LucideProps, "name"> & { name?: string | null; className?: string }) {
  if (name && name in icons) {
    const Cmp = icons[name as keyof typeof icons];
    return <Cmp className={className} {...props} />;
  }
  if (name) return <span className={className}>{name}</span>;
  return <Tag className={className} {...props} />;
}

const humanize = (n: string) => n.replace(/([a-z0-9])([A-Z])/g, "$1 $2");

export function IconPicker({
  value,
  onChange,
  label = "Icono",
}: {
  value: string;
  onChange: (name: string) => void;
  label?: string;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const term = q
      .trim()
      .toLowerCase()
      .replace(/[\s-_]/g, "");
    const list = term
      ? ICON_NAMES.filter((n) => n.toLowerCase().includes(term))
      : ICON_NAMES;
    return list.slice(0, 300);
  }, [q]);

  return (
    <div>
      <p className="text-sm font-medium mb-1.5">{label}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex-1 h-12 px-4 rounded-2xl bg-surface border border-border flex items-center gap-3 text-sm text-left"
        >
          <span className="size-8 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0">
            <DynamicIcon name={value} className="size-4" />
          </span>
          <span className={value ? "truncate" : "text-muted-foreground"}>
            {value ? humanize(value) : t("iconPicker.select")}
          </span>
          <Search className="size-4 text-muted-foreground ml-auto shrink-0" />
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="size-12 grid place-items-center rounded-2xl bg-muted text-muted-foreground shrink-0"
            aria-label={t("iconPicker.remove")}
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("iconPicker.title")}</DialogTitle>
            <DialogDescription>{t("iconPicker.subtitle")}</DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("iconPicker.search")}
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm"
            />
          </div>

          <div className="max-h-[50vh] overflow-y-auto -mx-1 px-1">
            {results.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {t("iconPicker.empty")}
              </p>
            ) : (
              <ul className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                {results.map((n) => {
                  const active = n === value;
                  return (
                    <li key={n}>
                      <button
                        type="button"
                        title={humanize(n)}
                        onClick={() => {
                          onChange(n);
                          setOpen(false);
                        }}
                        className={`w-full aspect-square rounded-xl grid place-items-center border transition ${
                          active
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border bg-surface hover:bg-muted"
                        }`}
                      >
                        <DynamicIcon name={n} className="size-5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {t("iconPicker.count")
              .replace("{shown}", String(results.length))
              .replace("{total}", String(ICON_NAMES.length))}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
