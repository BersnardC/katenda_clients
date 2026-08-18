import type { ReactNode } from "react";

export function Field({
  icon,
  ...props
}: { icon: ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex items-center gap-3 px-4 h-14 rounded-2xl bg-surface border border-border focus-within:border-primary transition">
      <span className="text-muted-foreground">{icon}</span>
      <input
        {...props}
        className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
      />
    </label>
  );
}
