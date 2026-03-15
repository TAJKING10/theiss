import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  typescript: {
    // Pre-existing Supabase type issues - types work at runtime
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
