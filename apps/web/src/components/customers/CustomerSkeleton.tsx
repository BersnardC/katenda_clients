export function CustomerSkeleton() {
  return (
    <li className="p-4 rounded-2xl bg-card border border-border animate-pulse flex gap-3">
      <div className="size-12 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-1/2 rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
        <div className="h-3 w-1/3 rounded bg-muted" />
      </div>
      <div className="w-16 space-y-2">
        <div className="h-4 rounded bg-muted" />
        <div className="h-3 rounded bg-muted" />
      </div>
    </li>
  );
}
