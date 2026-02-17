import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: ['@ims/ui', '@ims/types', '@ims/theming', '@ims/pwa'],
};
export default nextConfig;
