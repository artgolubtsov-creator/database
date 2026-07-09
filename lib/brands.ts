import type { BrandSlug } from '@/types/mock'

export interface BrandConfig {
  slug: BrandSlug
  name: string
  accent: string
  accentForeground: string
  description: string
  emoji: string
}

export const BRANDS: BrandConfig[] = [
  {
    slug: 'yango-play',
    name: 'Yango Play',
    accent: '#1A1A1A',
    accentForeground: '#FFFFFF',
    description: 'Streaming platform for movies, series and anime',
    emoji: '▶️',
  },
  {
    slug: 'yasmina',
    name: 'Yasmina',
    accent: '#C4956A',
    accentForeground: '#FFFFFF',
    description: 'AI-powered smart speaker for the Arab world',
    emoji: '🔮',
  },
  {
    slug: 'yango-music',
    name: 'Yango Music',
    accent: '#6C3FC5',
    accentForeground: '#FFFFFF',
    description: 'Music streaming service',
    emoji: '🎵',
  },
  {
    slug: 'yango-plus',
    name: 'Yango Plus',
    accent: '#E53935',
    accentForeground: '#FFFFFF',
    description: 'Subscription bundle with Taxi, Music and more',
    emoji: '⚡',
  },
  {
    slug: 'yango-taxi',
    name: 'Yango Taxi',
    accent: '#F5A623',
    accentForeground: '#000000',
    description: 'Ride-hailing service across MENA and Africa',
    emoji: '🚗',
  },
]

export function getBrand(slug: string): BrandConfig | undefined {
  return BRANDS.find((b) => b.slug === slug)
}

export const BRAND_SLUGS = BRANDS.map((b) => b.slug)
