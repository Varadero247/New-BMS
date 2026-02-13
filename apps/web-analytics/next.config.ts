import type { NextConfig } from 'next';
const nextConfig: NextConfig = { output: 'standalone', typescript: { ignoreBuildErrors: true }, eslint: { ignoreDuringBuilds: true }, transpilePackages: ['@ims/ui', '@ims/types'] };
export default nextConfig;
