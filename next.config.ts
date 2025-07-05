import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.modrinth.com',
        port: '',
        pathname: '/data/**',
      },
      {
        protocol: 'https',
        hostname: 'modrinth.com',
        port: '',
        pathname: '/assets/**',
      },
    ],
  },
};

export default nextConfig;
