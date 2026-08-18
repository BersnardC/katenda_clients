import { Outlet } from "react-router-dom";
import { MobileShell } from "@/components/MobileShell";
import { RequireAuth } from "@/components/RequireAuth";

export function Component() {
  return (
    <RequireAuth>
      <MobileShell>
        <div className="min-h-screen bg-background text-foreground">
          <Outlet />
        </div>
      </MobileShell>
    </RequireAuth>
  );
}
