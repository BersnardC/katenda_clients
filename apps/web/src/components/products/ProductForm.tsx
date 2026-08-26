import { useRef, useState, useMemo } from "react";
import { X, Upload, ImageIcon, Check, ChevronDown, Search, Star } from "lucide-react";
import { Switch } from "@katenda_clients/ui/switch";
import { useI18n } from "@/lib/i18n";
import { DynamicIcon } from "@/components/IconPicker";
import { compressImage } from "@/lib/image";
import type { Category } from "@/types/models";

export type ProductFormValue = {
  name: string;
  description: string;
  price: string;
  stock: string;
  categoryId: number | null;
  images: string[];
  available: boolean;
};

export function ProductForm({
  value,
  onChange,
  categories,
  mediaLimit,
}: {
  value: ProductFormValue;
  onChange: (v: ProductFormValue) => void;
  categories: Category[];
  mediaLimit?: number;
}) {
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [catQ, setCatQ] = useState("");

  const set = (patch: Partial<ProductFormValue>) =>
    onChange({ ...value, ...patch });

  const atMediaLimit =
    mediaLimit !== undefined && value.images.length >= mediaLimit;

  const handleFiles = async (files?: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining =
      mediaLimit !== undefined
        ? Math.max(mediaLimit - value.images.length, 0)
        : files.length;
    if (remaining <= 0) return;
    const list = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, remaining);
    const next = [...value.images];
    for (const file of list) {
      let optimized = file;
      try {
        optimized = await compressImage(file);
      } catch {
        // fallback al original
      }
      const url = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(optimized);
      });
      next.push(url);
    }
    set({ images: next });
  };

  const removeImage = (idx: number) => {
    set({ images: value.images.filter((_, i) => i !== idx) });
  };

  const catOptions = useMemo(
    () =>
      categories.filter((c) =>
        c.name.toLowerCase().includes(catQ.toLowerCase()),
      ),
    [categories, catQ],
  );

  const catName = value.categoryId
    ? (categories.find((c) => c.id === value.categoryId)?.name ?? null)
    : null;

  const inputCls =
    "w-full h-12 px-4 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm";

  return (
    <div className="space-y-4">
      {/* Images manager */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm font-medium">{t("products.images")}</p>
          {mediaLimit !== undefined && (
            <span className="text-xs font-semibold text-muted-foreground tabular-nums">
              {t("products.imagesCount")
                .replace("{count}", String(value.images.length))
                .replace("{limit}", String(mediaLimit))}
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {value.images.map((src, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border"
            >
              <img
                src={src}
                alt={`img-${i}`}
                className="w-full h-full object-cover"
              />
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                  <Star className="size-3" /> {t("products.cover")}
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1.5 right-1.5 size-7 grid place-items-center rounded-full bg-background/90 border border-border"
                aria-label={t("products.removeImage")}
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            disabled={atMediaLimit}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={`aspect-square rounded-2xl border-2 border-dashed grid place-items-center transition ${
              drag ? "border-primary bg-primary/5" : "border-border bg-surface"
            } ${atMediaLimit ? "opacity-50 pointer-events-none" : ""}`}
          >
            <div className="flex flex-col items-center gap-1 text-center px-2">
              <div className="size-9 rounded-xl gradient-brand grid place-items-center text-primary-foreground">
                <Upload className="size-4" />
              </div>
              <p className="text-[11px] font-semibold leading-tight">
                {t("products.addImage")}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {t("products.addImageSub")}
              </p>
            </div>
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Name */}
      <div>
        <p className="text-sm font-medium mb-1.5">{t("products.name")}</p>
        <input
          value={value.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="Ej. Camiseta Pro"
          className={inputCls}
        />
      </div>

      {/* Description */}
      <div>
        <p className="text-sm font-medium mb-1.5">
          {t("products.description")}
        </p>
        <textarea
          value={value.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder={t("products.description")}
          rows={3}
          className="w-full px-4 py-3 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm resize-none"
        />
      </div>

      {/* Price + stock */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-sm font-medium mb-1.5">{t("products.price")}</p>
          <input
            value={value.price}
            onChange={(e) => set({ price: e.target.value })}
            type="number"
            step="0.01"
            min="0"
            className={inputCls}
          />
        </div>
        <div>
          <p className="text-sm font-medium mb-1.5">{t("products.stock")}</p>
          <input
            value={value.stock}
            onChange={(e) => set({ stock: e.target.value })}
            type="number"
            min="0"
            className={inputCls}
          />
        </div>
      </div>

      {/* Category search-select */}
      <div>
        <p className="text-sm font-medium mb-1.5">{t("products.category")}</p>
        <button
          type="button"
          onClick={() => setCatOpen((v) => !v)}
          className={`${inputCls} flex items-center justify-between text-left`}
        >
          <span className={catName ? "" : "text-muted-foreground"}>
            {catName ?? t("products.categoryPlaceholder")}
          </span>
          <ChevronDown className={`size-4 transition ${catOpen ? "rotate-180" : ""}`} />
        </button>
        {catOpen && (
          <div className="mt-2 rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
            <div className="relative border-b border-border">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                autoFocus
                value={catQ}
                onChange={(e) => setCatQ(e.target.value)}
                placeholder={t("categories.search")}
                className="w-full h-11 pl-11 pr-4 bg-transparent outline-none text-sm"
              />
            </div>
            <ul className="max-h-56 overflow-y-auto py-1">
              {catOptions.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => {
                      set({ categoryId: c.id });
                      setCatOpen(false);
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
                    {value.categoryId === c.id && (
                      <Check className="size-4 text-primary" />
                    )}
                  </button>
                </li>
              ))}
              {catOptions.length === 0 && (
                <li className="px-4 py-4 text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
                  <ImageIcon className="size-3" /> {t("common.empty")}
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Available */}
      <div className="flex items-center gap-3 px-4 h-14 rounded-2xl bg-card border border-border">
        <span className="flex-1 font-medium text-sm">{t("products.active")}</span>
        <Switch
          checked={value.available}
          onCheckedChange={(v) => set({ available: v })}
        />
      </div>
    </div>
  );
}
