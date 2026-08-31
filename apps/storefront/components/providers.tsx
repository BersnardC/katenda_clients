"use client";

import type { ReactNode } from "react";
import { Toaster } from "@katenda_clients/ui/sonner";
import { ThemeProvider } from "@/lib/theme";
import { I18nProvider } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <CartProvider>
          {children}
          <Toaster position="top-center" richColors />
        </CartProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
