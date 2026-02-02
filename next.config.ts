import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Performance optimization */
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 604800, // 7 days
  },
  /* Compression */
  compress: true,
  /* Caching */
  headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=31536000",
          },
        ],
      },
    ];
  },
  /* Enable static exports for better performance */
  output: "standalone",
};

export default nextConfig;
