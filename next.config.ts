import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '*',
        port: '*',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '*',
        port: '*',
        pathname: '**',
      }
    ],
  },
};

export default nextConfig;
