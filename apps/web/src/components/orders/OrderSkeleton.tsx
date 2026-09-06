export function OrderCardSkeleton() {
  return (
    <li className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border shadow-soft">
      <div className="flex-1 space-y-2">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="h-3 w-40 bg-muted rounded animate-pulse" />
        <div className="h-3 w-52 bg-muted rounded animate-pulse" />
      </div>
      <div className="text-right space-y-2">
        <div className="h-5 w-16 bg-muted rounded animate-pulse ml-auto" />
        <div className="h-3 w-12 bg-muted rounded animate-pulse ml-auto" />
      </div>
    </li>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div className="px-5 py-6 space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-2xl bg-card border border-border space-y-3"
        >
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
