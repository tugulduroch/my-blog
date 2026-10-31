import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Админаас зураг оруулах (4MB хүртэл)
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
};

export default nextConfig;
