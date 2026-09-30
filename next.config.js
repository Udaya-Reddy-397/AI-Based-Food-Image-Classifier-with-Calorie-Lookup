/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
  },
  experimental: {
    serverComponentsExternalPackages: ["onnxruntime-node", "onnxruntime-web"],
  },
  webpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true, layers: true };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "onnxruntime-node": false,
      fs: false,
      path: false,
    };
    config.module.rules.push({
      test: /\.m?js$/,
      type: "javascript/auto",
      resolve: {
        fullySpecified: false,
      },
    });
    return config;
  },
};

module.exports = nextConfig;
