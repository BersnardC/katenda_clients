//import { useState } from 'react'
import { /* Routes, Route */ createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
/* import Login from "./pages/Login";
import Register from "./pages/Register";
import Publish from "./pages/Publish"; */
/* import reactLogo from './assets/react.svg' // <img src={reactLogo} className="logo react" alt="React logo" />*/
import './App.css'
import { Toaster } from "@katenda_clients/ui";
/* import { BrowserRouter } from "react-router-dom"; */
import Nav from "./components/Nav";
import { Button } from "@katenda_clients/ui";
import ProtectedRoute from "./components/ProtectedRoute";
import Posts from "./pages/Posts";

/* function App() {
  return (
    <BrowserRouter>
      <AuthProvider>

        <Nav />

        <div className="max-w-3xl mx-auto p-4">
          <Button>Click me</Button>
          <Routes>
            <Route path="/" element={<Posts />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/publish"
              element={
                <ProtectedRoute>
                  <Publish />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>

        <Toaster />

      </AuthProvider>
    </BrowserRouter>
  )
} */

function RootLayout() {
  return (
    <AuthProvider>
      <Nav />
      <div className="max-w-3xl mx-auto p-4">
        <Button onClick={() => alert('weje')}>Click me</Button>

        {/* Outlet es el espacio donde se renderizarán las páginas hijas de abajo */}
        <Outlet />
      </div>
      <Toaster />
    </AuthProvider>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Posts /> // Página de inicio normal
      },
      {
        path: "login",
        lazy: () => import("./pages/Login") // Carga diferida automática
      },
      {
        path: "register",
        lazy: () => import("./pages/Register")
      },
      {
        path: "publish",
        // Protegemos la ruta directamente envolviendo la carga diferida
        lazy: async () => {
          // 1. Descarga el archivo Publish.tsx solo cuando el usuario visita la ruta
          const module = await import("./pages/Publish");

          // 2. Extrae el componente visual (que renombraste a Component)
          const PublishComponent = module.Component;

          // 3. Devuelve el elemento ya envuelto por tu ProtectedRoute tradicional
          return {
            element: (
              <ProtectedRoute>
                <PublishComponent />
              </ProtectedRoute>
            )
          };
        }
      }
    ]
  }
]);

// 3. El componente principal solo renderiza el proveedor de rutas
function App() {
  return <RouterProvider router={router} />;
}

export default App
