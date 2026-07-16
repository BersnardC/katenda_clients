
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  es: {
    // Welcome Screen
    welcome: 'Bienvenido a',
    slogan: 'Genera descripciones perfectas para tus productos',
    getStarted: 'Comenzar',
    
    // Auth
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    loginWithGoogle: 'Continuar con Google',
    forgotPassword: '¿Olvidaste tu contraseña?',
    noAccount: '¿No tienes cuenta?',
    hasAccount: '¿Ya tienes cuenta?',
    
    // Header
    credits: 'Créditos',
    profile: 'Perfil',
    
    // Generator
    generateDescription: 'Generar Descripción',
    productName: 'Nombre del Producto',
    productDetails: 'Características y Detalles',
    uploadImages: 'Subir Imágenes',
    generate: 'Generar',
    
    // Product Page
    generatedDescription: 'Descripción Generada',
    saveDescription: 'Guardar Descripción',
    regenerate: 'Regenerar',
    
    // User Generations
    myGenerations: 'Mis Generaciones',
    recent: 'Recientes',
    
    // Profile
    myProfile: 'Mi Perfil',
    editProfile: 'Editar Perfil',
    logout: 'Cerrar Sesión',
    
    // Credits
    myCredits: 'Mis Créditos',
    buyCredits: 'Comprar Créditos',
    recharge: 'Recargar',
    creditsPacks: 'Paquetes de Créditos',
    
    // Navigation
    home: 'Inicio',
    generator: 'Generador',
    history: 'Historial',
    settings: 'Configuración',
  },
  en: {
    // Welcome Screen
    welcome: 'Welcome to',
    slogan: 'Generate perfect descriptions for your products',
    getStarted: 'Get Started',
    
    // Auth
    login: 'Login',
    register: 'Sign Up',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    loginWithGoogle: 'Continue with Google',
    forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    
    // Header
    credits: 'Credits',
    profile: 'Profile',
    
    // Generator
    generateDescription: 'Generate Description',
    productName: 'Product Name',
    productDetails: 'Features and Details',
    uploadImages: 'Upload Images',
    generate: 'Generate',
    
    // Product Page
    generatedDescription: 'Generated Description',
    saveDescription: 'Save Description',
    regenerate: 'Regenerate',
    
    // User Generations
    myGenerations: 'My Generations',
    recent: 'Recent',
    
    // Profile
    myProfile: 'My Profile',
    editProfile: 'Edit Profile',
    logout: 'Logout',
    
    // Credits
    myCredits: 'My Credits',
    buyCredits: 'Buy Credits',
    recharge: 'Recharge',
    creditsPacks: 'Credit Packs',
    
    // Navigation
    home: 'Home',
    generator: 'Generator',
    history: 'History',
    settings: 'Settings',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('es');
  
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['es']] || key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
