/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // For Capacitor mobile build, we need static export
  output: process.env.BUILD_MODE === 'mobile' ? 'export' : undefined,
  // Disable image optimization for static export
  images: {
    unoptimized: process.env.BUILD_MODE === 'mobile',
    domains: ['via.placeholder.com', 'localhost'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
  },
  // Trailing slash for better mobile compatibility
  trailingSlash: true,
}

module.exports = nextConfig
