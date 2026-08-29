import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

export interface SearchSelectOption {
  value: string;
  label: string;
  hint?: string;
  icon?: React.ReactNode;
}

export function SearchSelect({
  value,
  onChange,
  options,
  placeholder = "",
  searchPlaceholder = "",
  emptyLabel = "",
  allowClear = false,
  clearLabel = "",
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  options: SearchSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  allowClear?: boolean;
  clearLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      options.filter((o) =>
        o.label.toLowerCase().includes(q.toLowerCase()),
      ),
    [options, q],
  );

  const selected = options.find((o) => o.value === value);

  const inputCls =
    "w-full h-12 px-4 rounded-2xl bg-surface border border-border outline-none focus:border-primary text-sm";

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`${inputCls} flex items-center justify-between text-left`}
      >
        <span
          className={`flex items-center gap-2 ${
            selected ? "" : "text-muted-foreground"
          }`}
        >
          {selected?.icon}
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="mt-2 rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
          <div className="relative border-b border-border">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-11 pl-11 pr-4 bg-transparent outline-none text-sm"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {allowClear && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 h-11 text-sm hover:bg-muted"
                >
                  <span className="text-muted-foreground">{clearLabel}</span>
                  {value === null && <Check className="size-4 text-primary" />}
                </button>
              </li>
            )}
            {filtered.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 h-11 text-sm hover:bg-muted"
                >
                  <span className="flex items-center gap-2">
                    {o.icon}
                    {o.label}
                    {o.hint && (
                      <span className="text-xs text-muted-foreground">
                        {o.hint}
                      </span>
                    )}
                  </span>
                  {value === o.value && <Check className="size-4 text-primary" />}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-4 py-4 text-xs text-muted-foreground text-center">
                {emptyLabel}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
