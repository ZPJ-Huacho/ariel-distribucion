import type { Metadata, Viewport } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import { tenant } from "@/lib/data/tenant";
import { Toaster } from "@/components/ui/sonner";
import { StorageSync } from "@/components/storage-sync";
import { AuthSync } from "@/components/auth-sync";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: `${tenant.name} · ${tenant.tagline}`,
  description: `${tenant.name} — mayorista de fruta y verdura en Mercabarna. Catálogo, precios por caja y entrega en el día.`,
  openGraph: {
    title: tenant.name,
    description: tenant.tagline,
    type: "website",
    locale: "es_ES",
  },
};

export const viewport: Viewport = {
  themeColor: "#294f1f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={cn("h-full", geist.variable, playfair.variable)}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthSync />
        <StorageSync />
        {children}
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
