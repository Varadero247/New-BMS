import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@ims/ui', '@ims/types'],
};

export default nextConfig;
