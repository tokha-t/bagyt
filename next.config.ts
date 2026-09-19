import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Stage 7 moved into the roadmap; shared /next-action links must survive.
    return [{ source: "/next-action", destination: "/roadmap", permanent: false }];
  },
};

export default nextConfig;
