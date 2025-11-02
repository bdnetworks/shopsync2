
import type {NextConfig} from 'next';
const withPWA = require('next-pwa')({
  dest: 'public'
})

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NODE_ENV === 'production'
      ? 'https://your-production-url.com' // Replace with your actual production URL
      : 'http://localhost:9002',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.thefabricshop.nz',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '6000-firebase-shopsync2-1761566564683.cluster-w5vd22whf5gmav2vgkomwtc4go.cloudworkstations.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default withPWA(nextConfig);
