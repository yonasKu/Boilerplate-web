import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/onboarding',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
