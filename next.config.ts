import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {

  },
  output: "standalone",
  // 1. Optimize the file watcher
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        // IGNORING "data" stops the infinite rebuild loop on saves
        ignored: ["**/node_modules", "**/.git", "**/data/**"],
        // Reduce CPU usage by not polling too aggressively
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
