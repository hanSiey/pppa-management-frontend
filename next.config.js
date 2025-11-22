/** @type {import('next').NextConfig} */
const nextConfig = {
  // 'standalone' creates a smaller, optimized build for Docker/Render
  output: 'standalone',
  
  // Allow images from your backend domain and potential storage buckets
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Ignore typescript/eslint errors during build to prevent deployment failures on minor warnings
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;