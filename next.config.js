/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["ipfs.io", "gateway.pinata.cloud"],
    unoptimized: true,
  },
}

module.exports = nextConfig
