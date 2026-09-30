/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
  },
  serverExternalPackages: ["onnxruntime-node", "onnxruntime-web"],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "onnxruntime-node": false,
    };
    return config;
  },
};

module.exports = nextConfig;
