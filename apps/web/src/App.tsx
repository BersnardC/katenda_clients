import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { Providers } from "@/components/providers";

function RootLayout() {
  return (
    <Providers>
      <Outlet />
    </Providers>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        index: true,
        lazy: () => import("./pages/landing"),
      },
      {
        path: "auth",
        children: [
          {
            path: "login",
            lazy: () => import("./pages/auth/login"),
          },
          {
            path: "register",
            lazy: () => import("./pages/auth/register"),
          },
          {
            path: "recoverypass",
            lazy: () => import("./pages/auth/recoverypass"),
          },
        ],
      },
      {
        lazy: () => import("./pages/app/layout"),
        children: [
          { path: "dashboard", lazy: () => import("./pages/app/dashboard") },
          { path: "market", lazy: () => import("./pages/app/market") },
          { path: "publish", lazy: () => import("./pages/app/publish") },
          { path: "shops", lazy: () => import("./pages/app/shops") },
          { path: "profile", lazy: () => import("./pages/app/profile") },
          {
            path: "categories",
            lazy: () => import("./pages/app/categories/index"),
          },
          {
            path: "categories/:uuid",
            lazy: () => import("./pages/app/categories/detail"),
          },
          {
            path: "categories/:uuid/edit",
            lazy: () => import("./pages/app/categories/edit"),
          },
          { path: "products", lazy: () => import("./pages/app/products") },
          {
            path: "users",
            lazy: () => import("./pages/app/users/index"),
          },
          {
            path: "users/new",
            lazy: () => import("./pages/app/users/create"),
          },
          {
            path: "users/:uuid",
            lazy: () => import("./pages/app/users/detail"),
          },
          {
            path: "users/:uuid/edit",
            lazy: () => import("./pages/app/users/edit"),
          },
          {
            path: "roles",
            lazy: () => import("./pages/app/roles/index"),
          },
          {
            path: "roles/new",
            lazy: () => import("./pages/app/roles/create"),
          },
          {
            path: "roles/:uuid",
            lazy: () => import("./pages/app/roles/detail"),
          },
          {
            path: "roles/:uuid/edit",
            lazy: () => import("./pages/app/roles/edit"),
          },
          { path: "apps", lazy: () => import("./pages/app/apps") },
          { path: "stores", lazy: () => import("./pages/app/stores") },
          { path: "whatsapp", lazy: () => import("./pages/app/whatsapp") },
          { path: "payments", lazy: () => import("./pages/app/payments") },
          { path: "admin", lazy: () => import("./pages/app/admin") },
        ],
      },
      {
        path: "*",
        lazy: () => import("./pages/not-found"),
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
