/* import { SkeletonView } from "@/components/skeletons";
 */
export function RootHydrateFallback() {
  /* return (
    <div className="min-h-screen bg-background">
      <SkeletonView />
    </div>
  ); */
  return (
    <div className="min-h-dvh grid place-items-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 animate-pulse">
          <div className="size-11 grid place-items-center rounded-2xl gradient-brand shadow-pop">
            <span className="font-display font-extrabold text-2xl text-primary-foreground">K</span>
          </div>
          <span className="font-display font-extrabold text-2xl tracking-tight text-foreground">
            Katenda
          </span>
        </div>
        <div className="size-6 rounded-full border-2 border-border border-t-primary animate-spin" />
      </div>
    </div>
  );
  /* return (
    <div className="min-h-dvh grid place-items-center bg-background">
      <div className="size-8 rounded-full border-2 border-muted border-t-primary animate-spin" />
    </div>
  ); */
}
