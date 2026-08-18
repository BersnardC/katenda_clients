export function SkeletonView({
  tiles = 4,
  aspect = "aspect-[4/3]",
}: {
  tiles?: number;
  aspect?: string;
}) {
  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <div className="size-10 rounded-full bg-muted animate-pulse" />
        <div className="h-7 w-40 rounded-lg bg-muted animate-pulse" />
      </header>
      <div className="px-5 space-y-4">
        <div className={`w-full ${aspect} rounded-2xl bg-muted animate-pulse`} />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: tiles }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-12 w-full rounded-2xl bg-muted animate-pulse" />
      </div>
    </>
  );
}

export function SkeletonForm({ fields = 5 }: { fields?: number }) {
  return (
    <>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <div className="size-10 rounded-full bg-muted animate-pulse" />
        <div className="h-7 w-48 rounded-lg bg-muted animate-pulse" />
      </header>
      <div className="px-5 mt-2 space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="h-12 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    </>
  );
}
