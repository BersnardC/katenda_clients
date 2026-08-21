import { useRef, useState, useMemo } from "react";
import { X, Upload, ImageIcon, Check, ChevronDown, Search } from "lucide-react";
import { Switch } from "@katenda_clients/ui/switch";
import { useI18n } from "@/lib/i18n";
import { IconPicker, DynamicIcon } from "@/components/IconPicker";
import { compressImage } from "@/lib/image";
import type { Category } from "@/types/models";

export type CategoryFormValue = {
  name: string;
  image: string | null;
  icon: string;
  active: boolean;
  parentId: number | null;
};

export function CategoryForm({
  value,
  onChange,
  categories,
  excludeId,
}: {
  value: CategoryFormValue;
  onChange: (v: CategoryFormValue) => void;
  categories: Category[];
  excludeId?: number;
}) {
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [parentOpen, setParentOpen] = useState(false);
  const [parentQ, setParentQ] = useState("");

  const set = (patch: Partial<CategoryFormValue>) =>
    onChange({ ...value, ...patch });

  const handleFile = async (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    try {
      const optimized = await compressImage(file);
      reader.onload = () => set({ image: reader.result as string });
      reader.readAsDataURL(optimized);
    } catch {
      reader.onload = () => set({ image: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const parentOptions = useMemo(
    () =>
      categories.filter(
        (c) =>
          c.id !== excludeId &&
          c.name.toLowerCase().includes(parentQ.toLowerCase()),
      ),
    [categories, excludeId, parentQ],
  );

  const parentName = value.parentId
    ? (categories.find((c) => c.id === value.parentId)?.name ?? "—")
    : null;

  const inputCls =
    "w-full h-12 px-4 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm";

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-1.5">{t("categories.image")}</p>
        {value.image ? (
          <div className="relative w-full h-32 rounded-2xl overflow-hidden bg-muted border border-border">
            <img
              src={value.image}
              alt="preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => set({ image: null })}
              className="absolute top-2 right-2 size-8 grid place-items-center rounded-full bg-background/90 border border-border shadow-soft"
              aria-label={t("categories.removeImage")}
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              handleFile(e.dataTransfer.files[0]);
            }}
            className={`w-full h-32 rounded-2xl border-2 border-dashed grid place-items-center text-center transition ${
              drag ? "border-primary bg-primary/5" : "border-border bg-surface"
            }`}
          >
            <div className="flex flex-col items-center gap-1.5 px-6">
              <div className="size-9 rounded-xl gradient-brand grid place-items-center text-primary-foreground">
                <Upload className="size-4" />
              </div>
              <p className="text-xs font-semibold">
                {t("categories.dropzone")}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t("categories.dropzoneSub")}
              </p>
            </div>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-1.5">{t("categories.name")}</p>
        <input
          value={value.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="Ej. Moda"
          className={inputCls}
        />
      </div>

      <IconPicker value={value.icon} onChange={(icon) => set({ icon })} />

      <div>
        <p className="text-sm font-medium mb-1.5">{t("categories.parent")}</p>
        <button
          type="button"
          onClick={() => setParentOpen((v) => !v)}
          className={`${inputCls} flex items-center justify-between text-left`}
        >
          <span className={parentName ? "" : "text-muted-foreground"}>
            {parentName ?? t("categories.root")}
          </span>
          <ChevronDown
            className={`size-4 transition ${parentOpen ? "rotate-180" : ""}`}
          />
        </button>
        {parentOpen && (
          <div className="mt-2 rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
            <div className="relative border-b border-border">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                autoFocus
                value={parentQ}
                onChange={(e) => setParentQ(e.target.value)}
                placeholder={t("categories.search")}
                className="w-full h-11 pl-11 pr-4 bg-transparent outline-none text-sm"
              />
            </div>
            <ul className="max-h-56 overflow-y-auto py-1">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    set({ parentId: null });
                    setParentOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 h-11 text-sm hover:bg-muted"
                >
                  <span className="text-muted-foreground">
                    {t("categories.noParent")}
                  </span>
                  {value.parentId === null && (
                    <Check className="size-4 text-primary" />
                  )}
                </button>
              </li>
              {parentOptions.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => {
                      set({ parentId: c.id });
                      setParentOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 h-11 text-sm hover:bg-muted"
                  >
                    <span className="flex items-center gap-2">
                      <DynamicIcon
                        name={c.icon}
                        className="size-4 text-muted-foreground"
                      />
                      {c.name}
                    </span>
                    {value.parentId === c.id && (
                      <Check className="size-4 text-primary" />
                    )}
                  </button>
                </li>
              ))}
              {parentOptions.length === 0 && (
                <li className="px-4 py-4 text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
                  <ImageIcon className="size-3" /> {t("common.empty")}
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 px-4 h-14 rounded-2xl bg-card border border-border">
        <span className="flex-1 font-medium text-sm">
          {t("categories.active")}
        </span>
        <Switch
          checked={value.active}
          onCheckedChange={(v) => set({ active: v })}
        />
      </div>
    </div>
  );
}
