import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Le jeu ne sert aucune image distante : on garde la surface minimale.
  images: { remotePatterns: [] },
}

export default nextConfig
