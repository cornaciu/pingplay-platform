import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH ?? '',
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pingplay.ro',
        pathname: '/wp-content/uploads/2026/01/tenis-de-masa-timisoara-scaled-e1768661867958.png'
      }
    ]
  },
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/dashboard/rezervari',
        permanent: true
      },
      {
        source: '/apps/users',
        destination: '/apps/users/list',
        permanent: true
      }
    ]
  }
}

export default nextConfig
