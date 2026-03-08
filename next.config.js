/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    quality: 95,
  },
  experimental: {
    // keep defaults; add flags if your main project has them
  }
};

module.exports = nextConfig;
