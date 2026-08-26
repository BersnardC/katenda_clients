export function ProductSkeleton() {
  return (
    <li className="flex gap-3 p-3 rounded-2xl bg-card border border-border shadow-soft">
      <div className="size-20 rounded-xl shrink-0 bg-muted animate-pulse" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
            <div className="h-2.5 w-1/3 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-6 w-11 rounded-full bg-muted animate-pulse shrink-0" />
        </div>
        <div className="mt-2 h-4 w-16 rounded bg-muted animate-pulse" />
        <div className="mt-3 flex gap-1.5">
          <div className="h-6 w-16 rounded-lg bg-muted animate-pulse" />
          <div className="h-6 w-8 rounded-lg bg-muted animate-pulse ml-auto" />
        </div>
      </div>
    </li>
  );
}
