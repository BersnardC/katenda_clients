import { SkeletonView } from "@/components/skeletons";

export function RootHydrateFallback() {
  return (
    <div className="min-h-screen bg-background">
      <SkeletonView />
    </div>
  );
}
