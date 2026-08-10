import type { NextConfig } from "next";

const publicUrl = process.env.R2_PUBLIC_URL;

const nextConfig: NextConfig = {
  images: publicUrl
    ? {
        remotePatterns: [
          {
            protocol: publicUrl.startsWith("https") ? "https" : "http",
            hostname: new URL(publicUrl).hostname,
            pathname: "/**",
          },
        ],
      }
    : undefined,
  async redirects() {
    // Rutas antiguas de login/registro → home con modal auto-abierto.
    // Sirve como red de seguridad para bookmarks, tabs abiertas y JS cacheado
    // que aún apunten a esas URLs.
    return [
      { source: "/login", destination: "/?auth=login", permanent: false },
      { source: "/registro", destination: "/?auth=register", permanent: false },
    ];
  },
};

export default nextConfig;
