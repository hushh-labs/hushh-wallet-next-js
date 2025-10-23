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
};

export default nextConfig;
