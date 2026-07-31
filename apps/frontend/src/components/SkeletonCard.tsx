export function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <div className="aspect-square bg-muted animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-2 w-1/2 bg-muted rounded animate-pulse" />
        <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
        <div className="h-3 w-1/3 bg-muted rounded animate-pulse" />
      </div>
    </div>
  )
}
