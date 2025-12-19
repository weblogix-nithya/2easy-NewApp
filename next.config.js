/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.ap-southeast-2.amazonaws.com",
        pathname: "/2easy-prod-bucket/**",
      },
      {
        protocol: "https",
        hostname: "api.2easyfreight.com.au",
        pathname: "/images/**",
      },
    ],
  },
  env: {
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY, // server only
    NEXT_PUBLIC_MAPS_KEY: process.env.NEXT_PUBLIC_MAPS_KEY, // browser-safe
    NEXT_PUBLIC_GOOGLE_MAP_ID: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID,
  },
};

module.exports = nextConfig;
