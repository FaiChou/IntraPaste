import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.11.101',
        port: '9000',
        pathname: '/intrapaste/**',
        search: '',
      },
      {
        protocol: 'http',
        hostname: '100.64.0.19',
        port: '9000',
        pathname: '/intrapaste/**',
        search: '',
      },
    ],
  },
};

export default nextConfig;
