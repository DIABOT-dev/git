/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['lucide-react'],
  staticPageGenerationTimeout: 120,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  swcMinify: false,
  experimental: {
    // giữ nguyên
    optimizePackageImports: ['lucide-react'],
  },
  images: { unoptimized: true }, // gộp luôn ở đây
};

module.exports = nextConfig;
