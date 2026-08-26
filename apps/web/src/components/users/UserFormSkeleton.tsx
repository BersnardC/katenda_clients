export function UserFormSkeleton() {
  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <div className="size-10 rounded-full bg-muted animate-pulse" />
        <div className="h-7 w-48 rounded-lg bg-muted animate-pulse" />
      </header>
      <div className="px-5 mt-2 space-y-4">
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-muted animate-pulse" />
          <div className="h-12 rounded-2xl bg-muted animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-muted animate-pulse" />
          <div className="h-12 rounded-2xl bg-muted animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-muted animate-pulse" />
          <div className="h-12 rounded-2xl bg-muted animate-pulse" />
        </div>
        <div className="h-14 w-full rounded-2xl bg-muted animate-pulse" />
      </div>
    </>
  );
}
