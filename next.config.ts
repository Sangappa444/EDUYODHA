import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Ignore typescript errors during build for fast local development
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore linting errors during build for fast local development
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
