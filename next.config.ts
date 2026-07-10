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
};

export default nextConfig;
