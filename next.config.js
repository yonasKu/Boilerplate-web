/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups', // Allow OAuth popups to close properly
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless', // Allow embedding third-party content
          },
        ],
      },
    ];
  },
  experimental: {
    // Enable if you need additional security features
  },
  serverExternalPackages: [],
}

module.exports = nextConfig
