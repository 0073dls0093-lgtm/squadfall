/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [] },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false, path: false, stream: false,
    };
    return config;
  },
};

module.exports = nextConfig;