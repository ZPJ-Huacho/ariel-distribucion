import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { tenant } from "@/lib/data/tenant";
import { Toast } from "@/components/toast";
import { StorageSync } from "@/components/storage-sync";
import { AuthSync } from "@/components/auth-sync";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${tenant.name} · ${tenant.tagline}`,
  description: `${tenant.name} — fruta y verdura de Mercabarna a tu casa. Pide directo desde aquí.`,
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
    <html lang="es" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        <AuthSync />
        <StorageSync />
        {children}
        <Toast />
      </body>
    </html>
  );
}
