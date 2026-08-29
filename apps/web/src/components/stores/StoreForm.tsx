import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Switch } from "@katenda_clients/ui/switch";
import { useI18n } from "@/lib/i18n";
import { compressImage } from "@/lib/image";
import { slugify } from "@/lib/utils";
import { STORE_URL_PREFIX, ACCENT_FALLBACK } from "@/lib/store";

export type StoreFormValue = {
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  banner: string | null;
  active: boolean;
};

export function StoreForm({
  value,
  onChange,
}: {
  value: StoreFormValue;
  onChange: (v: StoreFormValue) => void;
}) {
  const { t } = useI18n();
  const [slugTouched, setSlugTouched] = useState(!!value.slug);

  const set = (patch: Partial<StoreFormValue>) =>
    onChange({ ...value, ...patch });

  const setName = (name: string) => {
    set({ name, ...(slugTouched ? {} : { slug: slugify(name) }) });
  };

  const inputCls =
    "w-full h-12 px-4 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm";

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-1.5">{t("stores.media")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageDrop
            label={t("stores.logo")}
            value={value.logo}
            onChange={(logo) => set({ logo })}
            className="h-32"
            round
          />
          <ImageDrop
            label={t("stores.banner")}
            value={value.banner}
            onChange={(banner) => set({ banner })}
            className="h-32"
          />
        </div>
        <div className="mt-2 rounded-2xl overflow-hidden border border-border">
          <div
            className="h-24 bg-muted relative"
            style={{ backgroundColor: ACCENT_FALLBACK + "22" }}
          >
            {value.banner && (
              <img
                src={value.banner}
                alt="Vista previa del banner"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="p-4 flex items-center gap-3 bg-card">
            <div
              className="size-12 rounded-2xl grid place-items-center overflow-hidden font-display font-extrabold text-white -mt-8 border-4 border-card"
              style={{ backgroundColor: ACCENT_FALLBACK }}
            >
              {value.logo ? (
                <img
                  src={value.logo}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                value.name.charAt(0)
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{value.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {value.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-1.5">{t("stores.name")}</p>
        <input
          value={value.name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          className={inputCls}
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-1.5">{t("stores.url")}</p>
        <div className="flex items-center h-12 rounded-2xl bg-surface border border-border overflow-hidden">
          <span className="px-3 text-xs text-muted-foreground">
            {STORE_URL_PREFIX}
          </span>
          <input
            value={value.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set({ slug: slugify(e.target.value) });
            }}
            maxLength={60}
            placeholder={t("stores.urlPlaceholder")}
            className="flex-1 h-full bg-transparent outline-none text-sm pr-3"
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-1.5">{t("stores.description")}</p>
        <textarea
          rows={3}
          value={value.description}
          onChange={(e) => set({ description: e.target.value })}
          className="w-full px-4 py-3 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm"
        />
      </div>

      <div className="flex items-center gap-3 px-4 h-14 rounded-2xl bg-card border border-border">
        <span className="flex-1 font-medium text-sm">{t("stores.active")}</span>
        <Switch
          checked={value.active}
          onCheckedChange={(active) => set({ active })}
        />
      </div>
    </div>
  );
}

function ImageDrop({
  label,
  value,
  onChange,
  className = "",
  round = false,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  className?: string;
  round?: boolean;
}) {
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const read = async (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const optimized = await compressImage(file);
      const reader = new FileReader();
      reader.onload = () => onChange(String(reader.result));
      reader.readAsDataURL(optimized);
    } catch {
      const reader = new FileReader();
      reader.onload = () => onChange(String(reader.result));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <div
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          read(e.dataTransfer.files[0]);
        }}
        className={`relative grid place-items-center cursor-pointer rounded-2xl border-2 border-dashed overflow-hidden transition ${
          drag ? "border-primary bg-primary/5" : "border-border bg-surface"
        } ${className}`}
      >
        {value ? (
          <>
            <img
              src={value}
              alt={label}
              className={`w-full h-full ${round ? "object-contain p-3" : "object-cover"}`}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="absolute top-2 right-2 size-7 grid place-items-center rounded-full bg-destructive text-destructive-foreground"
              aria-label={`Eliminar ${label}`}
            >
              <Trash2 className="size-3.5" />
            </button>
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            <ImagePlus className="size-6 mx-auto mb-1" />
            <p className="text-xs">{t("stores.dropzone")}</p>
          </div>
        )}
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => read(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
