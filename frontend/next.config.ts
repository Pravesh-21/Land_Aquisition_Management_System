import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    // Only proxy to an external backend when BACKEND_INTERNAL_URL is explicitly set.
    // On Vercel (no backend), this returns [] so Next.js API routes handle /api/v1/*
    const backendUrl = process.env.BACKEND_INTERNAL_URL;
    if (!backendUrl) return [];

    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
