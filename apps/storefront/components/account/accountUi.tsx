import { Package } from "lucide-react";

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength = 80,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  readOnly?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full h-12 px-4 rounded-2xl bg-surface border border-border outline-none text-sm disabled:opacity-60 read-only:opacity-60"
      />
    </label>
  );
}

export function EmptyState({
  icon: Icon,
  text,
}: {
  icon: typeof Package;
  text: string;
}) {
  return (
    <div className="py-16 text-center text-muted-foreground">
      <Icon className="size-10 mx-auto mb-3 opacity-50" />
      <p>{text}</p>
    </div>
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-3xl bg-card border border-border p-4 animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-6 w-20 rounded-full bg-muted" />
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded bg-muted"
          style={{ width: `${90 - i * 18}%` }}
        />
      ))}
      <div className="h-px bg-border" />
      <div className="flex justify-between">
        <div className="h-4 w-16 rounded bg-muted" />
        <div className="h-4 w-24 rounded bg-muted" />
      </div>
    </div>
  );
}
