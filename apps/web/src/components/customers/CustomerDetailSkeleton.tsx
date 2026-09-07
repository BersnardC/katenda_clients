export function CustomerDetailSkeleton() {
  return (
    <div className="px-5 pt-6 pb-8 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-muted" />
        <div className="h-6 w-40 rounded bg-muted" />
      </div>
      <div className="p-4 rounded-2xl border border-border flex gap-4 items-center">
        <div className="size-20 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/2 rounded bg-muted" />
          <div className="h-3 w-2/3 rounded bg-muted" />
          <div className="h-5 w-24 rounded-full bg-muted" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl border border-border bg-muted/50" />
        ))}
      </div>
      <div className="h-32 rounded-2xl border border-border bg-muted/40" />
      <div className="h-5 w-40 rounded bg-muted" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-20 rounded-2xl border border-border bg-muted/40" />
      ))}
    </div>
  );
}
