const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: true, // ✅ Clerk v6で必要な設定
  },
};

module.exports = nextConfig;

