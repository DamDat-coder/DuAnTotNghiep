import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
  },
  productionBrowserSourceMaps: false,
  reactStrictMode: false,
  compiler: {
    removeConsole: false,
  },
};

export default nextConfig;
