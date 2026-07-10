import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { GetSettingsUseCase, getSettingsRepository } from "@/core/settings";
import { getSession } from "@/core/auth";
import { Toaster } from "@/shared/components/atoms/sonner";
import { SettingsProvider } from "@/shared/providers/SettingsProvider";
import { UserProvider, type ClientUser } from "@/shared/providers/UserProvider";
import { headers } from "next/headers";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { StructuredData } from "@/shared/components/organisms/StructuredData";
import { themeStyleSheet } from "@/shared/lib/theme";
import { getActiveTheme } from "@/shared/lib/themes";
import { cn } from "@/shared/lib/utils";
import "./globals.css";

async function resolveOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

async function loadSettings() {
  return new GetSettingsUseCase(getSettingsRepository()).execute();
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await loadSettings();
  return {
    title: `${s.businessName}${s.tagline ? ` · ${s.tagline}` : ""}`,
    description: `${s.businessName}${s.tagline ? ` — ${s.tagline}.` : ""} Catálogo, precios por caja y entrega en el día.`,
    openGraph: {
      title: s.businessName,
      description: s.tagline,
      type: "website",
      locale: "es_ES",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0C3B3B",
  width: "device-width",
  initialScale: 1,
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [settings, session, origin] = await Promise.all([
    loadSettings(),
    getSession(),
    resolveOrigin(),
  ]);
  const clientUser: ClientUser = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      }
    : null;
  const theme = getActiveTheme(settings.theme);
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      data-theme={theme.id}
      data-vibe={theme.vibe}
      className={cn(
        "h-full",
        inter.variable,
        theme.mode === "dark" && "dark",
      )}
    >
      <body
        className="min-h-full flex flex-col font-sans"
        style={{
          background:
            "linear-gradient(180deg, var(--theme-tint) 0%, var(--background) 60%)",
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: themeStyleSheet(settings) }} />
        <StructuredData settings={settings} origin={origin} />
        <QueryProvider>
          <SettingsProvider settings={settings}>
            <UserProvider user={clientUser}>
              {children}
              <Toaster richColors closeButton />
            </UserProvider>
          </SettingsProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
