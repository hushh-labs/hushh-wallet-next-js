/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['passkit-generator'],
  turbopack: {},
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false, // 307 redirect
      },
    ];
  },
  async headers() {
    return [
      {
        // Force no cache for dashboard and card pages
        source: '/(dashboard|cards/:path*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          }
        ],
      },
    ];
  },
};

export default nextConfig;
