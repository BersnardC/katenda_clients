export function RoleDetailSkeleton() {
  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <div className="size-10 rounded-full bg-muted animate-pulse" />
        <div className="h-7 w-40 rounded-lg bg-muted animate-pulse" />
      </header>
      <div className="px-5 space-y-4">
        <div className="p-5 rounded-3xl bg-card border border-border shadow-soft flex gap-4">
          <div className="size-16 rounded-2xl shrink-0 bg-muted animate-pulse" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 rounded-2xl bg-card border border-border">
              <div className="size-4 mx-auto rounded bg-muted animate-pulse" />
              <div className="mt-2 h-3 w-10 mx-auto rounded bg-muted animate-pulse" />
              <div className="mt-1 h-2 w-14 mx-auto rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-3 w-24 rounded bg-muted animate-pulse" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-card border border-border space-y-3"
            >
              <div className="h-3 w-20 rounded bg-muted animate-pulse" />
              <div className="flex flex-wrap gap-2">
                <div className="h-8 w-16 rounded-full bg-muted animate-pulse" />
                <div className="h-8 w-20 rounded-full bg-muted animate-pulse" />
                <div className="h-8 w-14 rounded-full bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="flex-1 h-12 rounded-2xl bg-muted animate-pulse" />
          <div className="h-12 w-28 rounded-2xl bg-muted animate-pulse" />
        </div>
      </div>
    </>
  );
}
