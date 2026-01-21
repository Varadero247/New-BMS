import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@ims/ui', '@ims/charts', '@ims/types'],
};

export default nextConfig;
