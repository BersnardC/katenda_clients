import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { Toaster } from "@katenda_clients/ui";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { StoreProvider } from "@/contexts/StoreContext";
import { ThemeProvider } from "@/lib/theme";
import { LanguageProvider } from "@/lib/i18n";
import AuthLayout from "@/layouts/AuthLayout";
import AppLayout from "@/layouts/AppLayout";
import Onboarding from "@/pages/Onboarding";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RecoverPassword from "@/pages/RecoverPassword";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import StoreList from "@/pages/stores/StoreList";
import StoreForm from "@/pages/stores/StoreForm";
import StoreDetail from "@/pages/stores/StoreDetail";
import ProductForm from "@/pages/stores/ProductForm";
import ProductDetail from "@/pages/ProductDetail";
import Categories from "@/pages/Categories";
import CategoryForm from "@/pages/CategoryForm";
import Config from "@/pages/Config";
import Storefront from "@/pages/Storefront";
import "@/App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 1000 * 60 * 5 },
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
              <StoreProvider>
              <Routes>
                <Route path="/onboarding" element={<Onboarding />} />
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/recover-password" element={<RecoverPassword />} />
                </Route>
                <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/stores" element={<StoreList />} />
                  <Route path="/stores/new" element={<StoreForm />} />
                  <Route path="/stores/:uuid/edit" element={<StoreForm />} />
                  <Route path="/stores/:uuid" element={<StoreDetail />} />
                  <Route path="/stores/:storeUuid/products/new" element={<ProductForm />} />
                  <Route path="/stores/:storeUuid/products/:uuid/edit" element={<ProductForm />} />
                  <Route path="/stores/:storeUuid/products/:uuid" element={<ProductDetail />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/categories/new" element={<CategoryForm />} />
                  <Route path="/categories/:uuid/edit" element={<CategoryForm />} />
                  <Route path="/config" element={<Config />} />
                </Route>
                <Route path="/s/:slug" element={<Storefront />} />
                <Route path="*" element={<Navigate to="/onboarding" replace />} />
              </Routes>
              </StoreProvider>
              <Toaster />
            </AuthProvider>
          </BrowserRouter>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
