/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // keep defaults; add flags if your main project has them
  },

  /**
   * Fallback rewrites run AFTER the filesystem check, so images that
   * already exist in public/ at build-time are served normally (fast,
   * cached by CDN).  Images uploaded after the build (via admin panel)
   * fall through to the dynamic API route that reads them from disk.
   */
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: "/images/blog/:filename",
          destination: "/api/images/blog/:filename",
        },
      ],
    };
  },
};

module.exports = nextConfig;
