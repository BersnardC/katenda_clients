// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading } = useAuth();

  // 1. Primero comprueba si la API de Laravel aún está verificando la sesión
  if (loading) return <div className="p-4">Cargando...</div>;

  // 2. Si ya terminó de cargar y no hay usuario, redirige
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
