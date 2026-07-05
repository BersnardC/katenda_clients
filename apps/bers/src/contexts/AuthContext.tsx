
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  credits: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateCredits: (credits: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const login = async (email: string, _password: string) => {
    // Simulate login
    setUser({
      id: '1',
      email,
      name: email.split('@')[0],
      credits: 50
    });
    setLoading(false);
  };
  
  const loginWithGoogle = async () => {
    // Simulate Google login
    setUser({
      id: '1',
      email: 'user@gmail.com',
      name: 'Usuario Demo',
      credits: 50
    });
    setLoading(false);
  };
  
  const register = async (email: string, _password: string, name: string) => {
    // Simulate registration
    setUser({
      id: '1',
      email,
      name,
      credits: 10 // Welcome credits
    });
    setLoading(false);
  };
  
  const logout = () => {
    setUser(null);
  };
  
  const updateCredits = (credits: number) => {
    if (user) {
      setUser({ ...user, credits });
    }
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      loginWithGoogle,
      register,
      logout,
      updateCredits
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
