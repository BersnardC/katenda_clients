// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) return <div className="p-4">Cargando...</div>;

  return children;
};

export default ProtectedRoute;
