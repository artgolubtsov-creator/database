import type { MockAsset, MockCollection, BrandGuideline, BrandSlug } from '@/types/mock'

// ─── Assets ────────────────────────────────────────────────────────────────

export const MOCK_ASSETS: MockAsset[] = [
  // Yango Play
  { id: 'yp-1', brandSlug: 'yango-play', name: 'Main Logo — Dark', format: 'IMAGE', status: 'APPROVED', tags: ['logo', 'brand'], versions: 3, updatedAt: '2026-06-28', size: '42 KB', dimensions: '1200×400', collectionIds: ['yp-col-1'] },
  { id: 'yp-2', brandSlug: 'yango-play', name: 'App Icon — Round', format: 'IMAGE', status: 'APPROVED', tags: ['icon', 'app store'], versions: 2, updatedAt: '2026-06-20', size: '18 KB', dimensions: '512×512', collectionIds: ['yp-col-1'] },
  { id: 'yp-3', brandSlug: 'yango-play', name: 'Ramadan Banner — 1080×1080', format: 'IMAGE', status: 'APPROVED', campaign: 'Ramadan 2026', tags: ['banner', 'social', 'ramadan'], versions: 1, updatedAt: '2026-03-01', size: '310 KB', dimensions: '1080×1080', collectionIds: ['yp-col-2'] },
  { id: 'yp-4', brandSlug: 'yango-play', name: 'Ramadan Banner — Stories', format: 'IMAGE', status: 'APPROVED', campaign: 'Ramadan 2026', tags: ['banner', 'stories', 'ramadan'], versions: 1, updatedAt: '2026-03-01', size: '280 KB', dimensions: '1080×1920', collectionIds: ['yp-col-2'] },
  { id: 'yp-5', brandSlug: 'yango-play', name: 'Brand Guide v3.0', format: 'PDF', status: 'APPROVED', tags: ['guidelines', 'brand'], versions: 3, updatedAt: '2026-05-15', size: '8.2 MB', collectionIds: [] },
  { id: 'yp-6', brandSlug: 'yango-play', name: 'July Performance — Static Pack', format: 'IMAGE', status: 'REVIEW', campaign: 'July 2026', tags: ['performance', 'banner'], versions: 1, updatedAt: '2026-07-04', size: '1.1 MB', collectionIds: [] },
  { id: 'yp-7', brandSlug: 'yango-play', name: 'Crunchyroll Collab — Video 15s', format: 'VIDEO', status: 'APPROVED', tags: ['video', 'crunchyroll', 'collab'], versions: 2, updatedAt: '2026-04-10', size: '22 MB', dimensions: '1920×1080', collectionIds: ['yp-col-2'] },
  { id: 'yp-8', brandSlug: 'yango-play', name: 'After Effects Template — Standard', format: 'TEMPLATE', status: 'APPROVED', tags: ['template', 'after effects'], versions: 1, updatedAt: '2026-02-18', size: '45 MB', collectionIds: [] },
  { id: 'yp-9', brandSlug: 'yango-play', name: 'Noon Collab Banner Set', format: 'IMAGE', status: 'APPROVED', campaign: 'Noon Collab', tags: ['banner', 'noon', 'collab'], versions: 2, updatedAt: '2026-06-26', size: '890 KB', collectionIds: ['yp-col-2'] },
  { id: 'yp-10', brandSlug: 'yango-play', name: 'App Store Screenshots', format: 'IMAGE', status: 'APPROVED', tags: ['app store', 'screenshot'], versions: 1, updatedAt: '2026-05-01', size: '2.4 MB', collectionIds: ['yp-col-1'] },
  { id: 'yp-11', brandSlug: 'yango-play', name: 'Q3 Strategy Deck', format: 'PDF', status: 'DRAFT', tags: ['deck', 'internal'], versions: 1, updatedAt: '2026-07-05', size: '3.1 MB', collectionIds: [] },
  { id: 'yp-12', brandSlug: 'yango-play', name: 'OOH Billboard Mockup — Dubai', format: 'IMAGE', status: 'ARCHIVED', campaign: 'Ramadan 2026', tags: ['ooh', 'billboard', 'dubai'], versions: 1, updatedAt: '2026-04-15', size: '12 MB', dimensions: '3000×1500', collectionIds: [] },

  // Yasmina
  { id: 'ym-1', brandSlug: 'yasmina', name: 'Yasmina Logo — Full Color', format: 'IMAGE', status: 'APPROVED', tags: ['logo', 'brand'], versions: 2, updatedAt: '2026-06-10', size: '55 KB', dimensions: '1200×400', collectionIds: ['ym-col-1'] },
  { id: 'ym-2', brandSlug: 'yasmina', name: 'Product Render — Sand', format: 'IMAGE', status: 'APPROVED', tags: ['product', 'render'], versions: 3, updatedAt: '2026-06-15', size: '1.8 MB', dimensions: '2400×2400', collectionIds: ['ym-col-1', 'ym-col-2'] },
  { id: 'ym-3', brandSlug: 'yasmina', name: 'Product Render — Sage', format: 'IMAGE', status: 'APPROVED', tags: ['product', 'render', 'green'], versions: 2, updatedAt: '2026-06-18', size: '1.9 MB', dimensions: '2400×2400', collectionIds: ['ym-col-1', 'ym-col-2'] },
  { id: 'ym-4', brandSlug: 'yasmina', name: 'Hero Banner — Scroll Stop', format: 'IMAGE', status: 'APPROVED', campaign: 'June 2026', tags: ['banner', 'hero'], versions: 1, updatedAt: '2026-06-19', size: '620 KB', collectionIds: ['ym-col-2'] },
  { id: 'ym-5', brandSlug: 'yasmina', name: 'AI Speaker vs Columns — Static', format: 'IMAGE', status: 'REVIEW', campaign: 'July 2026', tags: ['performance', 'comparison'], versions: 1, updatedAt: '2026-07-05', size: '540 KB', collectionIds: [] },
  { id: 'ym-6', brandSlug: 'yasmina', name: 'Shopify Egypt — Landing', format: 'PDF', status: 'DRAFT', tags: ['landing', 'egypt', 'shopify'], versions: 1, updatedAt: '2026-07-03', size: '2.1 MB', collectionIds: [] },
  { id: 'ym-7', brandSlug: 'yasmina', name: 'Brand Video 30s — Arabic', format: 'VIDEO', status: 'APPROVED', tags: ['video', 'arabic', 'brand'], versions: 1, updatedAt: '2026-05-28', size: '48 MB', dimensions: '1920×1080', collectionIds: ['ym-col-2'] },
  { id: 'ym-8', brandSlug: 'yasmina', name: 'Packaging Mockup — Box', format: 'IMAGE', status: 'APPROVED', tags: ['packaging', 'product'], versions: 2, updatedAt: '2026-04-20', size: '3.4 MB', dimensions: '2000×2000', collectionIds: ['ym-col-1'] },
  { id: 'ym-9', brandSlug: 'yasmina', name: 'Podcast Shamandar — Kids Art', format: 'IMAGE', status: 'REVIEW', campaign: 'Shamandar', tags: ['kids', 'podcast'], versions: 1, updatedAt: '2026-07-06', size: '890 KB', collectionIds: [] },
  { id: 'ym-10', brandSlug: 'yasmina', name: 'ASMR Campaign — Visuals', format: 'IMAGE', status: 'APPROVED', campaign: 'ASMR', tags: ['asmr', 'campaign'], versions: 1, updatedAt: '2026-07-01', size: '760 KB', collectionIds: ['ym-col-2'] },
  { id: 'ym-11', brandSlug: 'yasmina', name: 'Animals vs Yasmina — Tabby Offer', format: 'IMAGE', status: 'APPROVED', campaign: 'Animals', tags: ['comparison', 'offer'], versions: 2, updatedAt: '2026-06-24', size: '480 KB', collectionIds: ['ym-col-2'] },
  { id: 'ym-12', brandSlug: 'yasmina', name: 'Color Guide — 7 Lights', format: 'PDF', status: 'APPROVED', tags: ['colors', 'product'], versions: 1, updatedAt: '2026-06-17', size: '1.4 MB', collectionIds: ['ym-col-1'] },

  // Yango Music
  { id: 'mu-1', brandSlug: 'yango-music', name: 'Music Logo — White', format: 'IMAGE', status: 'APPROVED', tags: ['logo', 'brand'], versions: 1, updatedAt: '2026-05-10', size: '38 KB', dimensions: '1200×400', collectionIds: ['mu-col-1'] },
  { id: 'mu-2', brandSlug: 'yango-music', name: 'The Weeknd — Concert Creatives', format: 'IMAGE', status: 'APPROVED', campaign: 'The Weeknd', tags: ['artist', 'collab', 'concert'], versions: 1, updatedAt: '2026-06-28', size: '1.2 MB', collectionIds: ['mu-col-2'] },
  { id: 'mu-3', brandSlug: 'yango-music', name: 'July Releases — Banner Pack', format: 'IMAGE', status: 'REVIEW', campaign: 'July 2026', tags: ['banner', 'releases'], versions: 1, updatedAt: '2026-07-05', size: '2.1 MB', collectionIds: [] },
  { id: 'mu-4', brandSlug: 'yango-music', name: 'AI Voices — Campaign Visuals', format: 'IMAGE', status: 'APPROVED', campaign: 'AI Voices', tags: ['ai', 'campaign'], versions: 2, updatedAt: '2026-05-25', size: '940 KB', collectionIds: ['mu-col-2'] },
  { id: 'mu-5', brandSlug: 'yango-music', name: 'Singing Football Fans — Video', format: 'VIDEO', status: 'APPROVED', campaign: 'Football', tags: ['video', 'football', 'ugc'], versions: 1, updatedAt: '2026-06-30', size: '34 MB', dimensions: '1080×1920', collectionIds: ['mu-col-2'] },
  { id: 'mu-6', brandSlug: 'yango-music', name: 'Genre Mix — Banner Set', format: 'IMAGE', status: 'APPROVED', tags: ['banner', 'genre'], versions: 2, updatedAt: '2026-05-18', size: '1.5 MB', collectionIds: [] },
  { id: 'mu-7', brandSlug: 'yango-music', name: 'Brand Guidelines v2', format: 'PDF', status: 'APPROVED', tags: ['guidelines'], versions: 2, updatedAt: '2026-04-01', size: '6.8 MB', collectionIds: ['mu-col-1'] },
  { id: 'mu-8', brandSlug: 'yango-music', name: 'CTA AB Test — Variants', format: 'IMAGE', status: 'APPROVED', campaign: 'CTA Test', tags: ['ab-test', 'cta'], versions: 1, updatedAt: '2026-06-03', size: '210 KB', collectionIds: [] },

  // Yango Plus
  { id: 'pl-1', brandSlug: 'yango-plus', name: 'Plus Logo — Red', format: 'IMAGE', status: 'APPROVED', tags: ['logo', 'brand'], versions: 2, updatedAt: '2026-05-20', size: '41 KB', dimensions: '1200×400', collectionIds: ['pl-col-1'] },
  { id: 'pl-2', brandSlug: 'yango-plus', name: 'Ajman Banners — Static', format: 'IMAGE', status: 'APPROVED', campaign: 'Ajman', tags: ['banner', 'ajman', 'uae'], versions: 1, updatedAt: '2026-07-02', size: '1.3 MB', collectionIds: ['pl-col-2'] },
  { id: 'pl-3', brandSlug: 'yango-plus', name: 'Promo Code — META Pack', format: 'IMAGE', status: 'APPROVED', campaign: 'Promo', tags: ['promo', 'meta', 'tiktok'], versions: 2, updatedAt: '2026-06-08', size: '880 KB', collectionIds: ['pl-col-2'] },
  { id: 'pl-4', brandSlug: 'yango-plus', name: 'Annual Offer — Landing Assets', format: 'IMAGE', status: 'APPROVED', campaign: 'Annual Offer', tags: ['landing', 'annual', 'offer'], versions: 3, updatedAt: '2026-02-15', size: '2.2 MB', collectionIds: [] },
  { id: 'pl-5', brandSlug: 'yango-plus', name: 'Sharjah Banners', format: 'IMAGE', status: 'ARCHIVED', campaign: 'Sharjah', tags: ['banner', 'uae', 'sharjah'], versions: 1, updatedAt: '2025-12-10', size: '1.1 MB', collectionIds: [] },
  { id: 'pl-6', brandSlug: 'yango-plus', name: 'Brand Guide v1', format: 'PDF', status: 'APPROVED', tags: ['guidelines'], versions: 1, updatedAt: '2026-01-15', size: '4.2 MB', collectionIds: ['pl-col-1'] },
]

// ─── Collections ───────────────────────────────────────────────────────────

export const MOCK_COLLECTIONS: MockCollection[] = [
  { id: 'yp-col-1', brandSlug: 'yango-play', name: 'Brand Identity Pack', description: 'Logos, icons and app store materials for agency use', access: 'EXTERNAL', assetIds: ['yp-1', 'yp-2', 'yp-10'], createdAt: '2026-05-01', token: 'ext-yp-brand' },
  { id: 'yp-col-2', brandSlug: 'yango-play', name: 'Campaign Assets — H1 2026', description: 'All approved campaign materials for H1 2026', access: 'EXTERNAL', assetIds: ['yp-3', 'yp-4', 'yp-7', 'yp-9'], createdAt: '2026-03-10', token: 'ext-yp-h1' },
  { id: 'yp-col-3', brandSlug: 'yango-play', name: 'Internal Templates', description: 'AE and Figma templates for internal use only', access: 'INTERNAL', assetIds: ['yp-8', 'yp-5'], createdAt: '2026-02-20', token: 'int-yp-templates' },
  { id: 'ym-col-1', brandSlug: 'yasmina', name: 'Product Visuals', description: 'Official product renders and packaging for press and agencies', access: 'EXTERNAL', assetIds: ['ym-1', 'ym-2', 'ym-3', 'ym-8', 'ym-12'], createdAt: '2026-06-01', token: 'ext-ym-product' },
  { id: 'ym-col-2', brandSlug: 'yasmina', name: 'Performance Creatives', description: 'Approved campaign assets for media buying', access: 'EXTERNAL', assetIds: ['ym-4', 'ym-7', 'ym-10', 'ym-11'], createdAt: '2026-06-15', token: 'ext-ym-perf' },
  { id: 'mu-col-1', brandSlug: 'yango-music', name: 'Brand Kit', description: 'Logo and brand guidelines for partners', access: 'EXTERNAL', assetIds: ['mu-1', 'mu-7'], createdAt: '2026-04-05', token: 'ext-mu-brand' },
  { id: 'mu-col-2', brandSlug: 'yango-music', name: 'Artist Collabs', description: 'Approved visuals for artist collaborations', access: 'EXTERNAL', assetIds: ['mu-2', 'mu-4', 'mu-5'], createdAt: '2026-06-25', token: 'ext-mu-artists' },
  { id: 'pl-col-1', brandSlug: 'yango-plus', name: 'Brand Identity', description: 'Logos and brand guide', access: 'EXTERNAL', assetIds: ['pl-1', 'pl-6'], createdAt: '2026-01-20', token: 'ext-pl-brand' },
  { id: 'pl-col-2', brandSlug: 'yango-plus', name: 'UAE Campaign Pack', description: 'Banners and creatives for UAE campaigns', access: 'EXTERNAL', assetIds: ['pl-2', 'pl-3'], createdAt: '2026-06-01', token: 'ext-pl-uae' },
]

// ─── Guidelines ────────────────────────────────────────────────────────────

export const MOCK_GUIDELINES: Record<BrandSlug, BrandGuideline> = {
  'yango-play': {
    colors: [
      { name: 'Primary Black', hex: '#1A1A1A' },
      { name: 'Red', hex: '#E53935', pantone: 'Pantone 485 C' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Light Grey', hex: '#F5F5F5' },
      { name: 'Neutral', hex: '#9E9E9E' },
    ],
    fonts: [
      { name: 'YS Text', variants: ['Regular', 'Medium', 'Bold'], specimen: 'Watch. Discover. Enjoy.' },
      { name: 'YS Display', variants: ['Regular', 'Bold'], specimen: 'Stream the World' },
    ],
    logoVariants: [
      { name: 'Full Logo — Dark', background: 'light', format: 'SVG' },
      { name: 'Full Logo — White', background: 'dark', format: 'SVG' },
      { name: 'Icon Only — Dark', background: 'light', format: 'PNG' },
      { name: 'Icon Only — White', background: 'dark', format: 'PNG' },
    ],
    doList: ['Use the logo with minimum 20px clear space', 'Use approved color combinations only', 'Scale proportionally'],
    dontList: ["Don't stretch or distort the logo", "Don't place on low-contrast backgrounds", "Don't use unauthorized color variants"],
  },
  'yasmina': {
    colors: [
      { name: 'Gold', hex: '#C4956A' },
      { name: 'Sand', hex: '#F5E6D3' },
      { name: 'Deep Brown', hex: '#3D2B1F' },
      { name: 'Sage', hex: '#8A9E8B' },
      { name: 'White', hex: '#FFFFFF' },
    ],
    fonts: [
      { name: 'Geist', variants: ['Light', 'Regular', 'Medium', 'Bold'], specimen: 'تكلم معها. هي تسمع.' },
      { name: 'Noto Naskh Arabic', variants: ['Regular', 'Bold'], specimen: 'ياسمينا — صديقتك الذكية' },
    ],
    logoVariants: [
      { name: 'Wordmark — Gold', background: 'light', format: 'SVG' },
      { name: 'Wordmark — White', background: 'dark', format: 'SVG' },
      { name: 'Monogram — Dark', background: 'light', format: 'PNG' },
      { name: 'Arabic Lockup', background: 'light', format: 'SVG' },
    ],
    doList: ['Use gold as primary accent', 'Pair with sand/white backgrounds', 'Use Arabic and English lockups appropriately'],
    dontList: ["Don't use logo on non-approved backgrounds", "Don't mix gold with unrelated brand colors", "Don't use low resolution assets"],
  },
  'yango-music': {
    colors: [
      { name: 'Purple', hex: '#6C3FC5', pantone: 'Pantone 266 C' },
      { name: 'Light Purple', hex: '#A78BFA' },
      { name: 'Black', hex: '#0D0D0D' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Neon Green', hex: '#B9FF4B' },
    ],
    fonts: [
      { name: 'YS Text', variants: ['Regular', 'Medium', 'Bold'], specimen: 'Your Music, Your Way' },
      { name: 'YS Display', variants: ['Black'], specimen: 'Play What You Feel' },
    ],
    logoVariants: [
      { name: 'Full Logo — Purple', background: 'light', format: 'SVG' },
      { name: 'Full Logo — White', background: 'dark', format: 'SVG' },
      { name: 'Icon Only', background: 'dark', format: 'PNG' },
      { name: 'Horizontal Lockup', background: 'light', format: 'SVG' },
    ],
    doList: ['Use purple on dark backgrounds for max impact', 'Neon green is accent only — use sparingly', 'Maintain contrast ratios for accessibility'],
    dontList: ["Don't use purple on light grey backgrounds", "Don't combine neon green with purple in equal weight", "Don't rotate the logo"],
  },
  'yango-plus': {
    colors: [
      { name: 'Red', hex: '#E53935', pantone: 'Pantone 485 C' },
      { name: 'Dark Red', hex: '#B71C1C' },
      { name: 'Black', hex: '#1A1A1A' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Light Grey', hex: '#F5F5F5' },
    ],
    fonts: [
      { name: 'YS Text', variants: ['Regular', 'Medium', 'Bold'], specimen: 'More for Less. Every Day.' },
      { name: 'YS Display', variants: ['Bold', 'Black'], specimen: 'Plus Everything' },
    ],
    logoVariants: [
      { name: 'Full Logo — Red', background: 'light', format: 'SVG' },
      { name: 'Full Logo — White', background: 'dark', format: 'SVG' },
      { name: 'Badge — Red', background: 'light', format: 'PNG' },
      { name: 'Badge — White', background: 'dark', format: 'PNG' },
    ],
    doList: ['Use red as primary action color', 'Maintain white space around logo', 'Use bold typography for offers'],
    dontList: ["Don't use red on orange backgrounds", "Don't alter the plus symbol proportions", "Don't use gradients with the logo"],
  },
}

// ─── Helpers ───────────────────────────────────────────────────────────────

export function getAssetsByBrand(slug: BrandSlug): MockAsset[] {
  return MOCK_ASSETS.filter((a) => a.brandSlug === slug)
}

export function getAssetById(id: string): MockAsset | undefined {
  return MOCK_ASSETS.find((a) => a.id === id)
}

export function getCollectionsByBrand(slug: BrandSlug): MockCollection[] {
  return MOCK_COLLECTIONS.filter((c) => c.brandSlug === slug)
}

export function getCollectionById(id: string): MockCollection | undefined {
  return MOCK_COLLECTIONS.find((c) => c.id === id)
}

export function getCollectionByToken(token: string): MockCollection | undefined {
  return MOCK_COLLECTIONS.find((c) => c.token === token)
}

export function getAssetsByCollection(collectionId: string): MockAsset[] {
  const col = getCollectionById(collectionId)
  if (!col) return []
  return MOCK_ASSETS.filter((a) => col.assetIds.includes(a.id))
}
