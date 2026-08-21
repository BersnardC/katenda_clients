import { Outlet } from "react-router-dom";
import { MobileShell } from "@/components/MobileShell";
import { RequireAuth } from "@/components/RequireAuth";
import { AppProvider } from "@/contexts/AppContext";

export function Component() {
  return (
    <RequireAuth>
      <AppProvider>
        <MobileShell>
          <div className="min-h-screen bg-background text-foreground">
            <Outlet />
          </div>
        </MobileShell>
      </AppProvider>
    </RequireAuth>
  );
}
