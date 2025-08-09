import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
  },
  productionBrowserSourceMaps: false,
};

export default nextConfig;
