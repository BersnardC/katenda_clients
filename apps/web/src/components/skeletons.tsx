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

const Bar = ({ className = "" }: { className?: string }) => (
  <div className={`bg-muted animate-pulse ${className}`} />
);

function SkeletonCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-3xl bg-card border border-border shadow-soft space-y-3">
      {children}
    </div>
  );
}

export function SkeletonStoreForm() {
  return (
    <div className="space-y-4">
      <SkeletonCard>
        <Bar className="h-3 w-24 rounded-sm" />
        <div className="space-y-1.5">
          <Bar className="h-4 w-28 rounded" />
          <Bar className="h-12 w-full rounded-2xl" />
        </div>
        <div className="space-y-1.5">
          <Bar className="h-4 w-20 rounded" />
          <Bar className="h-12 w-full rounded-2xl" />
        </div>
        <div className="space-y-1.5">
          <Bar className="h-4 w-24 rounded" />
          <Bar className="h-20 w-full rounded-2xl" />
        </div>
      </SkeletonCard>

      <SkeletonCard>
        <Bar className="h-3 w-32 rounded-sm" />
        <Bar className="h-3 w-56 rounded" />
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Bar key={i} className="size-10 rounded-full" />
          ))}
          <Bar className="size-10 rounded-full border-2 border-dashed border-border" />
        </div>
      </SkeletonCard>

      <SkeletonCard>
        <Bar className="h-3 w-28 rounded-sm" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Bar className="h-32 w-full rounded-2xl border-2 border-dashed border-border" />
          <Bar className="h-32 w-full rounded-2xl border-2 border-dashed border-border" />
        </div>
        <div className="rounded-2xl overflow-hidden border border-border">
          <Bar className="h-24 w-full" />
          <div className="p-4 flex items-center gap-3 bg-card">
            <Bar className="size-12 rounded-2xl -mt-8 border-4 border-card shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Bar className="h-4 w-32 rounded" />
              <Bar className="h-3 w-48 rounded" />
            </div>
          </div>
        </div>
      </SkeletonCard>

      <SkeletonCard>
        <Bar className="h-3 w-36 rounded-sm" />
        <div className="space-y-1.5">
          <Bar className="h-4 w-20 rounded" />
          <Bar className="h-16 w-full rounded-2xl" />
        </div>
        <div className="space-y-1.5">
          <Bar className="h-4 w-28 rounded" />
          <Bar className="h-12 w-full rounded-2xl" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Bar className="h-4 w-16 rounded" />
            <Bar className="h-12 w-full rounded-2xl" />
          </div>
          <div className="space-y-1.5">
            <Bar className="h-4 w-24 rounded" />
            <Bar className="h-12 w-full rounded-2xl" />
          </div>
        </div>
      </SkeletonCard>

      <SkeletonCard>
        <Bar className="h-3 w-20 rounded-sm" />
        <Bar className="h-12 w-full rounded-2xl" />
        <Bar className="h-12 w-full rounded-2xl" />
      </SkeletonCard>

      <SkeletonCard>
        <Bar className="h-3 w-28 rounded-sm" />
        <Bar className="h-14 w-full rounded-2xl" />
        <div className="space-y-1.5">
          <Bar className="h-4 w-40 rounded" />
          <Bar className="h-14 w-full rounded-2xl" />
        </div>
        <div className="space-y-1.5">
          <Bar className="h-4 w-36 rounded" />
          <Bar className="h-12 w-full rounded-2xl" />
        </div>
      </SkeletonCard>

      <SkeletonCard>
        <Bar className="h-3 w-16 rounded-sm" />
        <Bar className="h-14 w-full rounded-2xl" />
      </SkeletonCard>
    </div>
  );
}
