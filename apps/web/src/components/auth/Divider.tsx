export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <span className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <span className="flex-1 h-px bg-border" />
    </div>
  );
}
