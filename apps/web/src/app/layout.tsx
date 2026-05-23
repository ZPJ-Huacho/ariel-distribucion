import type { Metadata, Viewport } from "next";
import { Mulish, Playfair_Display } from "next/font/google";
import { tenant } from "@/lib/data/tenant";
import { Toast } from "@/components/toast";
import { StorageSync } from "@/components/storage-sync";
import { AuthSync } from "@/components/auth-sync";
import "./globals.css";

const mulish = Mulish({
  variable: "--font-app",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
  themeColor: tenant.primaryColor,
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
      className={`${mulish.variable} ${playfair.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-canvas)] text-[var(--color-ink)]">
        <AuthSync />
        <StorageSync />
        {children}
        <Toast />
      </body>
    </html>
  );
}
