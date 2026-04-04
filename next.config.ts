import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  webpack: (config, { nextRuntime }) => {
    // Set next-intl config alias only for server (not Edge) compilations.
    // Keeping it out of the edge bundle prevents next-intl internals from
    // being bundled into middleware, which crashes Vercel's Edge Runtime.
    if (nextRuntime !== 'edge') {
      config.resolve.alias['next-intl/config'] = path.join(
        process.cwd(),
        'i18n/request.ts'
      )
    }
    return config
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
}

export default nextConfig
