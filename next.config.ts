import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents: true, // Disabled for dynamic routes compatibility
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "*.app.github.dev",
      ],
    },
  },
};

export default nextConfig;
