import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    serverActions: {
      // Image uploads go through a server action. The default limit is 1 MB;
      // 4.5 MB matches Vercel's request body cap. Files are limited to 4 MB
      // in app/dashboard/actions.ts, leaving room for multipart overhead.
      bodySizeLimit: "4.5mb",
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
