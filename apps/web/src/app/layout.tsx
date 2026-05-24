import type { Metadata, Viewport } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { StorageSync } from "@/components/storage-sync";
import { AuthSync } from "@/components/auth-sync";
import { TenantProvider } from "@/components/tenant-provider";
import { getCurrentTenant } from "@/lib/api-server";
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

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getCurrentTenant();
  return {
    title: `${tenant.name} · ${tenant.tagline}`,
    description: `${tenant.name} — ${tenant.tagline}. Catálogo, precios por caja y entrega en el día.`,
    openGraph: {
      title: tenant.name,
      description: tenant.tagline,
      type: "website",
      locale: "es_ES",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#294f1f",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tenant = await getCurrentTenant();
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={cn("h-full", geist.variable, playfair.variable)}
    >
      <body className="min-h-full flex flex-col font-sans">
        <TenantProvider tenant={tenant}>
          <AuthSync />
          <StorageSync />
          {children}
          <Toaster richColors closeButton />
        </TenantProvider>
      </body>
    </html>
  );
}
