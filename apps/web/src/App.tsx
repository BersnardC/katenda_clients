import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { Toaster } from "@katenda_clients/ui";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/lib/theme";
import { LanguageProvider } from "@/lib/i18n";
import AuthLayout from "@/layouts/AuthLayout";
import AppLayout from "@/layouts/AppLayout";
import Onboarding from "@/pages/Onboarding";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RecoverPassword from "@/pages/RecoverPassword";
import Dashboard from "@/pages/Dashboard";
import "@/App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-4 text-muted-foreground">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/onboarding" element={<Onboarding />} />
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/recover-password" element={<RecoverPassword />} />
                </Route>
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                </Route>
                <Route path="*" element={<Navigate to="/onboarding" replace />} />
              </Routes>
              <Toaster />
            </AuthProvider>
          </BrowserRouter>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
