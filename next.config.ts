import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["picsum.photos"],
  },
  // Keep optional heavy packages out of the client bundle
  serverExternalPackages: ['@aws-sdk/client-s3', 'cloudinary', 'mime-types'],
};

export default nextConfig;
