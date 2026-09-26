import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ThemeInit } from "@/components/theme-init";

export const metadata: Metadata = {
  title: "Katenda Store — Compra online y pide por WhatsApp",
  description:
    "Catálogo público de la tienda: busca productos, filtra por categorías, arma tu carrito y envía tu pedido por WhatsApp.",
};

export const viewport: Viewport = {
  themeColor: "#12B886",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
        />
        <ThemeInit />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
