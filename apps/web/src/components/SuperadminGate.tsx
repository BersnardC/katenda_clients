import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function SuperadminGate({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!user?.is_superadmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
