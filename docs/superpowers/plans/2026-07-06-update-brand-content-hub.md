# update — Brand Content Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a frontend-only prototype of the "update" brand content hub on top of the existing Content Hub — left sidebar shell, 4-brand structure, asset grid, collections, guidelines, external portal, and a floating demo role switcher.

**Architecture:** Extend existing Next.js 16 App Router app. New `/brands/[brand]/*` routes use a shared authenticated layout with a left sidebar. Static mock data replaces DB calls throughout. A client-side demo role context (localStorage) drives role-based UI differences without touching auth.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4, TypeScript, existing NextAuth v5, lucide-react

---

## File Map

**Create:**
- `types/mock.ts` — TypeScript interfaces for mock data
- `lib/brands.ts` — brand config (slug, name, accent color, accent foreground)
- `lib/mock-data.ts` — all static assets, collections, guidelines per brand
- `lib/demo-role-context.tsx` — React context for floating role switcher
- `components/RoleSwitcher.tsx` — floating pill UI (bottom-right)
- `components/Sidebar.tsx` — left fixed sidebar
- `components/AssetCard.tsx` — asset thumbnail card
- `components/CollectionCard.tsx` — collection card
- `app/brands/layout.tsx` — authenticated layout with sidebar
- `app/brands/[brand]/page.tsx` — brand overview
- `app/brands/[brand]/assets/page.tsx` — asset grid with filters
- `app/brands/[brand]/assets/[id]/page.tsx` — asset detail
- `app/brands/[brand]/collections/page.tsx` — collections list
- `app/brands/[brand]/collections/[id]/page.tsx` — collection detail
- `app/brands/[brand]/guidelines/page.tsx` — brand guidelines
- `app/portal/[token]/layout.tsx` — portal layout (no sidebar, no auth nav)
- `app/portal/[token]/page.tsx` — external portal

**Modify:**
- `app/page.tsx` — replace default Next.js page with brand selector
- `app/layout.tsx` — wrap with DemoRoleProvider
- `app/globals.css` — add `--color-accent` and `--color-accent-fg` tokens

**Keep unchanged:** `/dashboard`, `/offers`, `/brand-materials`, `/admin`, all auth

---

## Task 1: Types + Brand Config

**Files:**
- Create: `types/mock.ts`
- Create: `lib/brands.ts`

- [ ] **Create `types/mock.ts`**

```typescript
export type BrandSlug = 'yango-play' | 'yasmina' | 'yango-music' | 'yango-plus'
export type AssetFormat = 'IMAGE' | 'VIDEO' | 'PDF' | 'TEMPLATE'
export type AssetStatus = 'APPROVED' | 'REVIEW' | 'DRAFT' | 'ARCHIVED'
export type CollectionAccess = 'INTERNAL' | 'EXTERNAL'
export type DemoRole = 'Admin' | 'Brand Manager' | 'Internal Viewer' | 'External Agency'

export interface MockAsset {
  id: string
  brandSlug: BrandSlug
  name: string
  format: AssetFormat
  status: AssetStatus
  campaign?: string
  tags: string[]
  versions: number
  updatedAt: string
  size: string
  dimensions?: string
  collectionIds: string[]
}

export interface MockCollection {
  id: string
  brandSlug: BrandSlug
  name: string
  description: string
  access: CollectionAccess
  assetIds: string[]
  createdAt: string
  token: string
}

export interface BrandColor {
  name: string
  hex: string
  pantone?: string
}

export interface BrandFont {
  name: string
  variants: string[]
  specimen: string
}

export interface BrandLogoVariant {
  name: string
  background: 'light' | 'dark'
  format: 'SVG' | 'PNG'
}

export interface BrandGuideline {
  colors: BrandColor[]
  fonts: BrandFont[]
  logoVariants: BrandLogoVariant[]
  doList: string[]
  dontList: string[]
}
```

- [ ] **Create `lib/brands.ts`**

```typescript
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
]

export function getBrand(slug: string): BrandConfig | undefined {
  return BRANDS.find((b) => b.slug === slug)
}

export const BRAND_SLUGS = BRANDS.map((b) => b.slug)
```

- [ ] **Commit**

```bash
git add types/mock.ts lib/brands.ts
git commit -m "feat: add mock types and brand config"
```

---

## Task 2: Static Mock Data

**Files:**
- Create: `lib/mock-data.ts`

- [ ] **Create `lib/mock-data.ts`**

```typescript
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
    dontList: ['Don't stretch or distort the logo', 'Don't place on low-contrast backgrounds', 'Don't use unauthorized color variants'],
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
    dontList: ['Don't use logo on non-approved backgrounds', 'Don't mix gold with unrelated brand colors', 'Don't use low resolution assets'],
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
    dontList: ['Don't use purple on light grey backgrounds', 'Don't combine neon green with purple in equal weight', 'Don't rotate the logo'],
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
    dontList: ['Don't use red on orange backgrounds', 'Don't alter the plus symbol proportions', 'Don't use gradients with the logo'],
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
```

- [ ] **Commit**

```bash
git add lib/mock-data.ts
git commit -m "feat: add static mock data for all brands"
```

---

## Task 3: Demo Role Context + CSS Tokens

**Files:**
- Create: `lib/demo-role-context.tsx`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Create `lib/demo-role-context.tsx`**

```tsx
"use client"
import { createContext, useContext, useEffect, useState } from "react"
import type { DemoRole } from "@/types/mock"

const STORAGE_KEY = "update_demo_role"
const DEFAULT_ROLE: DemoRole = "Admin"

interface DemoRoleContextValue {
  demoRole: DemoRole
  setDemoRole: (role: DemoRole) => void
}

const DemoRoleContext = createContext<DemoRoleContextValue>({
  demoRole: DEFAULT_ROLE,
  setDemoRole: () => {},
})

export function DemoRoleProvider({ children }: { children: React.ReactNode }) {
  const [demoRole, setDemoRoleState] = useState<DemoRole>(DEFAULT_ROLE)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as DemoRole | null
    if (stored) setDemoRoleState(stored)
  }, [])

  function setDemoRole(role: DemoRole) {
    setDemoRoleState(role)
    localStorage.setItem(STORAGE_KEY, role)
  }

  return (
    <DemoRoleContext.Provider value={{ demoRole, setDemoRole }}>
      {children}
    </DemoRoleContext.Provider>
  )
}

export function useDemoRole() {
  return useContext(DemoRoleContext)
}

// Permission helpers based on demo role
export function canUpload(role: DemoRole) {
  return role === "Admin" || role === "Brand Manager"
}
export function canApprove(role: DemoRole) {
  return role === "Admin" || role === "Brand Manager"
}
export function canCreateCollection(role: DemoRole) {
  return role === "Admin" || role === "Brand Manager"
}
export function canSharePortal(role: DemoRole) {
  return role === "Admin" || role === "Brand Manager"
}
export function isExternalOnly(role: DemoRole) {
  return role === "External Agency"
}
```

- [ ] **Add brand accent tokens to `app/globals.css`** (after existing `:root` block)

```css
/* Brand accent tokens — set per-brand via inline style on layout */
:root {
  --color-accent: #1A1A1A;
  --color-accent-fg: #FFFFFF;
}

/* Status badge colors */
.status-approved  { background: #dcfce7; color: #166534; }
.status-review    { background: #fef9c3; color: #854d0e; }
.status-draft     { background: #f5f5f5; color: #525252; }
.status-archived  { background: #e5e5e5; color: #737373; }

/* Format badge colors */
.format-image    { background: #dbeafe; color: #1e40af; }
.format-video    { background: #ede9fe; color: #5b21b6; }
.format-pdf      { background: #fee2e2; color: #991b1b; }
.format-template { background: #fef3c7; color: #92400e; }
```

- [ ] **Wrap `app/layout.tsx` with DemoRoleProvider**

Replace the existing `app/layout.tsx` content with:

```tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { DemoRoleProvider } from "@/lib/demo-role-context"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "update — Brand Content Hub",
  description: "Internal brand asset management",
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full">
        <DemoRoleProvider>{children}</DemoRoleProvider>
      </body>
    </html>
  )
}
```

- [ ] **Run dev server and confirm no errors**

```bash
npm run dev
```
Expected: server starts at localhost:3000 with no TypeScript errors.

- [ ] **Commit**

```bash
git add lib/demo-role-context.tsx app/globals.css app/layout.tsx
git commit -m "feat: add demo role context and brand CSS tokens"
```

---

## Task 4: RoleSwitcher Component

**Files:**
- Create: `components/RoleSwitcher.tsx`

- [ ] **Create `components/RoleSwitcher.tsx`**

```tsx
"use client"
import { useDemoRole } from "@/lib/demo-role-context"
import type { DemoRole } from "@/types/mock"

const ROLES: DemoRole[] = ["Admin", "Brand Manager", "Internal Viewer", "External Agency"]

const ROLE_COLORS: Record<DemoRole, string> = {
  "Admin": "bg-neutral-900 text-white",
  "Brand Manager": "bg-violet-600 text-white",
  "Internal Viewer": "bg-sky-600 text-white",
  "External Agency": "bg-amber-500 text-white",
}

export function RoleSwitcher() {
  const { demoRole, setDemoRole } = useDemoRole()

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <div className="flex flex-col gap-1 bg-white rounded-2xl shadow-lg border border-neutral-200 p-2 w-44">
        <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider px-2 py-1">Demo Role</p>
        {ROLES.map((role) => (
          <button
            key={role}
            onClick={() => setDemoRole(role)}
            className={`text-xs font-medium px-3 py-2 rounded-lg text-left transition-all ${
              demoRole === role
                ? ROLE_COLORS[role]
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            {role}
          </button>
        ))}
      </div>
      <div className={`text-xs font-semibold px-3 py-1.5 rounded-full ${ROLE_COLORS[demoRole]}`}>
        {demoRole}
      </div>
    </div>
  )
}
```

- [ ] **Commit**

```bash
git add components/RoleSwitcher.tsx
git commit -m "feat: add floating demo role switcher"
```

---

## Task 5: Sidebar Component

**Files:**
- Create: `components/Sidebar.tsx`

- [ ] **Create `components/Sidebar.tsx`**

```tsx
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { useDemoRole, canUpload, isExternalOnly } from "@/lib/demo-role-context"
import { getBrand } from "@/lib/brands"
import {
  LayoutGrid, Images, FolderOpen, BookOpen, Settings,
  LogOut, ChevronLeft, Upload
} from "lucide-react"

interface SidebarProps {
  brandSlug: string
  userName?: string | null
}

export function Sidebar({ brandSlug, userName }: SidebarProps) {
  const pathname = usePathname()
  const { demoRole } = useDemoRole()
  const brand = getBrand(brandSlug)

  const navLinks = [
    { href: `/brands/${brandSlug}`, label: "Overview", icon: LayoutGrid, exact: true },
    { href: `/brands/${brandSlug}/assets`, label: "Assets", icon: Images },
    { href: `/brands/${brandSlug}/collections`, label: "Collections", icon: FolderOpen },
    { href: `/brands/${brandSlug}/guidelines`, label: "Guidelines", icon: BookOpen },
  ]

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <aside
      className="w-[220px] shrink-0 h-screen sticky top-0 flex flex-col border-r border-neutral-200 bg-white"
    >
      {/* Brand header */}
      <div
        className="px-4 py-4 border-b border-neutral-200"
        style={{ backgroundColor: brand?.accent, color: brand?.accentForeground }}
      >
        <Link href="/" className="flex items-center gap-2 mb-3 opacity-70 hover:opacity-100 transition-opacity">
          <ChevronLeft size={14} />
          <span className="text-xs">All Brands</span>
        </Link>
        <p className="text-xs opacity-60 font-medium uppercase tracking-wider">update</p>
        <p className="text-sm font-bold mt-0.5">{brand?.name ?? brandSlug}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navLinks.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
              isActive(href, exact)
                ? "bg-neutral-100 text-neutral-900 font-medium"
                : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
            )}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Upload CTA */}
      {canUpload(demoRole) && (
        <div className="px-3 pb-3">
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
            <Upload size={14} />
            Upload Asset
          </button>
        </div>
      )}

      {/* Admin link */}
      {demoRole === "Admin" && (
        <div className="px-3 pb-2">
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname.startsWith("/admin")
                ? "bg-neutral-100 text-neutral-900 font-medium"
                : "text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50"
            )}
          >
            <Settings size={15} />
            Admin
          </Link>
        </div>
      )}

      {/* User footer */}
      <div className="border-t border-neutral-200 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-neutral-900 truncate max-w-[120px]">{userName ?? "User"}</p>
          <p className="text-[10px] text-neutral-400">{demoRole}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-neutral-400 hover:text-neutral-700 transition-colors"
          title="Sign out"
        >
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **Commit**

```bash
git add components/Sidebar.tsx
git commit -m "feat: add left sidebar component"
```

---

## Task 6: Brands Layout + Brand Selector Homepage

**Files:**
- Create: `app/brands/layout.tsx`
- Modify: `app/page.tsx`

- [ ] **Create `app/brands/layout.tsx`**

```tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/Sidebar"
import { RoleSwitcher } from "@/components/RoleSwitcher"
import { BRAND_SLUGS } from "@/lib/brands"

export default async function BrandsLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ brand?: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { brand } = await params
  const brandSlug = brand ?? ""

  // Validate brand slug
  if (brandSlug && !BRAND_SLUGS.includes(brandSlug as never)) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar brandSlug={brandSlug} userName={session.user.name} />
      <main className="flex-1 min-w-0 bg-[#fafafa]">
        {children}
      </main>
      <RoleSwitcher />
    </div>
  )
}
```

- [ ] **Replace `app/page.tsx` with brand selector**

```tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { BRANDS } from "@/lib/brands"
import { getAssetsByBrand } from "@/lib/mock-data"
import { RoleSwitcher } from "@/components/RoleSwitcher"

export default async function HomePage() {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-8 py-6">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1">update</p>
        <h1 className="text-2xl font-bold text-neutral-900">Brand Content Hub</h1>
        <p className="text-sm text-neutral-500 mt-1">Select a brand to browse and manage assets</p>
      </header>

      {/* Brand grid */}
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="grid grid-cols-2 gap-5">
          {BRANDS.map((brand) => {
            const assets = getAssetsByBrand(brand.slug)
            const approvedCount = assets.filter((a) => a.status === "APPROVED").length
            return (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="group bg-white rounded-2xl card-shadow hover:card-shadow-hover transition-all overflow-hidden border border-neutral-100"
              >
                {/* Color bar */}
                <div
                  className="h-2 w-full"
                  style={{ backgroundColor: brand.accent }}
                />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: brand.accent + "18" }}
                    >
                      {brand.emoji}
                    </div>
                    <span className="text-xs font-medium text-neutral-400 bg-neutral-100 px-2 py-1 rounded-full">
                      {assets.length} assets
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-neutral-900 mb-1 group-hover:text-neutral-700 transition-colors">
                    {brand.name}
                  </h2>
                  <p className="text-sm text-neutral-500 mb-4">{brand.description}</p>
                  <div className="flex items-center gap-4 text-xs text-neutral-400">
                    <span>{approvedCount} approved</span>
                    <span>{assets.filter((a) => a.status === "REVIEW").length} in review</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <RoleSwitcher />
    </div>
  )
}
```

- [ ] **Verify in browser:** open `localhost:3000`, confirm brand selector shows 4 cards with stats.

- [ ] **Commit**

```bash
git add app/brands/layout.tsx app/page.tsx
git commit -m "feat: add brand selector homepage and brands layout"
```

---

## Task 7: Asset + Collection Cards

**Files:**
- Create: `components/AssetCard.tsx`
- Create: `components/CollectionCard.tsx`

- [ ] **Create `components/AssetCard.tsx`**

```tsx
import Link from "next/link"
import type { MockAsset } from "@/types/mock"
import { FileText, Video, Image, FileCode } from "lucide-react"

const FORMAT_ICONS = {
  IMAGE: Image,
  VIDEO: Video,
  PDF: FileText,
  TEMPLATE: FileCode,
}

const FORMAT_CLASS = {
  IMAGE: "format-image",
  VIDEO: "format-video",
  PDF: "format-pdf",
  TEMPLATE: "format-template",
}

const STATUS_CLASS = {
  APPROVED: "status-approved",
  REVIEW: "status-review",
  DRAFT: "status-draft",
  ARCHIVED: "status-archived",
}

interface AssetCardProps {
  asset: MockAsset
  href: string
}

export function AssetCard({ asset, href }: AssetCardProps) {
  const Icon = FORMAT_ICONS[asset.format]

  return (
    <Link
      href={href}
      className="group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:border-neutral-300 hover:shadow-md transition-all"
    >
      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-neutral-100 flex items-center justify-center relative">
        <Icon size={28} className="text-neutral-300" />
        {asset.versions > 1 && (
          <span className="absolute top-2 right-2 text-[10px] bg-white/90 text-neutral-500 px-1.5 py-0.5 rounded font-medium">
            v{asset.versions}
          </span>
        )}
      </div>
      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-neutral-900 truncate mb-2">{asset.name}</p>
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${FORMAT_CLASS[asset.format]}`}>
            {asset.format}
          </span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${STATUS_CLASS[asset.status]}`}>
            {asset.status}
          </span>
        </div>
        <p className="text-[10px] text-neutral-400 mt-2">{asset.updatedAt}</p>
      </div>
    </Link>
  )
}
```

- [ ] **Create `components/CollectionCard.tsx`**

```tsx
import Link from "next/link"
import type { MockCollection } from "@/types/mock"
import { Lock, Globe, FolderOpen } from "lucide-react"

interface CollectionCardProps {
  collection: MockCollection
  href: string
}

export function CollectionCard({ collection, href }: CollectionCardProps) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-xl border border-neutral-200 p-4 hover:border-neutral-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center">
          <FolderOpen size={16} className="text-neutral-400" />
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full ${
          collection.access === "EXTERNAL"
            ? "bg-green-50 text-green-700"
            : "bg-neutral-100 text-neutral-500"
        }`}>
          {collection.access === "EXTERNAL" ? <Globe size={10} /> : <Lock size={10} />}
          {collection.access === "EXTERNAL" ? "External" : "Internal"}
        </div>
      </div>
      <p className="text-sm font-semibold text-neutral-900 mb-1">{collection.name}</p>
      <p className="text-xs text-neutral-500 mb-3 line-clamp-2">{collection.description}</p>
      <p className="text-xs text-neutral-400">{collection.assetIds.length} assets</p>
    </Link>
  )
}
```

- [ ] **Commit**

```bash
git add components/AssetCard.tsx components/CollectionCard.tsx
git commit -m "feat: add AssetCard and CollectionCard components"
```

---

## Task 8: Brand Overview Page

**Files:**
- Create: `app/brands/[brand]/page.tsx`

- [ ] **Create `app/brands/[brand]/page.tsx`**

```tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import { getBrand } from "@/lib/brands"
import { getAssetsByBrand, getCollectionsByBrand } from "@/lib/mock-data"
import { AssetCard } from "@/components/AssetCard"
import { CollectionCard } from "@/components/CollectionCard"
import { ArrowRight } from "lucide-react"

export default async function BrandOverviewPage({
  params,
}: {
  params: Promise<{ brand: string }>
}) {
  const { brand } = await params
  const config = getBrand(brand)
  if (!config) notFound()

  const assets = getAssetsByBrand(config.slug)
  const collections = getCollectionsByBrand(config.slug)
  const recent = assets.filter((a) => a.status !== "ARCHIVED").slice(0, 6)

  const stats = {
    total: assets.length,
    approved: assets.filter((a) => a.status === "APPROVED").length,
    review: assets.filter((a) => a.status === "REVIEW").length,
    collections: collections.length,
  }

  return (
    <div className="px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{config.name}</h1>
        <p className="text-sm text-neutral-500 mt-1">{config.description}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Assets", value: stats.total },
          { label: "Approved", value: stats.approved },
          { label: "In Review", value: stats.review },
          { label: "Collections", value: stats.collections },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-neutral-200 px-5 py-4">
            <p className="text-2xl font-bold text-neutral-900">{value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Assets */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-neutral-900">Recent Assets</h2>
          <Link
            href={`/brands/${brand}/assets`}
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {recent.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              href={`/brands/${brand}/assets/${asset.id}`}
            />
          ))}
        </div>
      </section>

      {/* Collections */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-neutral-900">Collections</h2>
          <Link
            href={`/brands/${brand}/collections`}
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {collections.map((col) => (
            <CollectionCard
              key={col.id}
              collection={col}
              href={`/brands/${brand}/collections/${col.id}`}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Verify in browser:** open `localhost:3000/brands/yango-play`, confirm overview page with stats, assets, collections.

- [ ] **Commit**

```bash
git add app/brands/[brand]/page.tsx
git commit -m "feat: add brand overview page"
```

---

## Task 9: Assets Grid Page

**Files:**
- Create: `app/brands/[brand]/assets/page.tsx`
- Create: `app/brands/[brand]/assets/AssetsClient.tsx`

- [ ] **Create `app/brands/[brand]/assets/AssetsClient.tsx`**

```tsx
"use client"
import { useState } from "react"
import { AssetCard } from "@/components/AssetCard"
import type { MockAsset, AssetFormat, AssetStatus } from "@/types/mock"
import { Search } from "lucide-react"

const ALL_FORMATS: AssetFormat[] = ["IMAGE", "VIDEO", "PDF", "TEMPLATE"]
const ALL_STATUSES: AssetStatus[] = ["APPROVED", "REVIEW", "DRAFT", "ARCHIVED"]

export function AssetsClient({ assets, brandSlug }: { assets: MockAsset[]; brandSlug: string }) {
  const [search, setSearch] = useState("")
  const [format, setFormat] = useState<AssetFormat | "ALL">("ALL")
  const [status, setStatus] = useState<AssetStatus | "ALL">("ALL")

  const campaigns = Array.from(new Set(assets.map((a) => a.campaign).filter(Boolean)))

  const filtered = assets.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    const matchFormat = format === "ALL" || a.format === format
    const matchStatus = status === "ALL" || a.status === status
    return matchSearch && matchFormat && matchStatus
  })

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets..."
            className="pl-8 pr-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 w-52"
          />
        </div>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as AssetFormat | "ALL")}
          className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none"
        >
          <option value="ALL">All Formats</option>
          {ALL_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as AssetStatus | "ALL")}
          className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-xs text-neutral-400 ml-auto">{filtered.length} assets</span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-neutral-400 text-sm">No assets match your filters</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              href={`/brands/${brandSlug}/assets/${asset.id}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Create `app/brands/[brand]/assets/page.tsx`**

```tsx
import { notFound } from "next/navigation"
import { getBrand } from "@/lib/brands"
import { getAssetsByBrand } from "@/lib/mock-data"
import { AssetsClient } from "./AssetsClient"

export default async function AssetsPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params
  const config = getBrand(brand)
  if (!config) notFound()

  const assets = getAssetsByBrand(config.slug)

  return (
    <div className="px-8 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Assets</h1>
        <p className="text-sm text-neutral-500 mt-1">{config.name} — all brand assets</p>
      </div>
      <AssetsClient assets={assets} brandSlug={brand} />
    </div>
  )
}
```

- [ ] **Verify in browser:** open `localhost:3000/brands/yango-play/assets`, test search and filter dropdowns.

- [ ] **Commit**

```bash
git add app/brands/[brand]/assets/
git commit -m "feat: add assets grid page with filters"
```

---

## Task 10: Asset Detail Page

**Files:**
- Create: `app/brands/[brand]/assets/[id]/page.tsx`

- [ ] **Create `app/brands/[brand]/assets/[id]/page.tsx`**

```tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import { getBrand } from "@/lib/brands"
import { getAssetById } from "@/lib/mock-data"
import { ChevronLeft, Download, ExternalLink, Clock, Tag } from "lucide-react"
import { FileText, Video, Image, FileCode } from "lucide-react"

const FORMAT_ICONS = { IMAGE: Image, VIDEO: Video, PDF: FileText, TEMPLATE: FileCode }
const STATUS_CLASS = {
  APPROVED: "status-approved",
  REVIEW: "status-review",
  DRAFT: "status-draft",
  ARCHIVED: "status-archived",
}

const MOCK_VERSIONS = [
  { version: "v3", date: "2026-07-01", author: "Паша М.", note: "Final approved version" },
  { version: "v2", date: "2026-06-28", author: "Паша М.", note: "Revised after review" },
  { version: "v1", date: "2026-06-25", author: "Паша М.", note: "Initial upload" },
]

const MOCK_COMMENTS = [
  { author: "Артем Г.", date: "2026-06-30", text: "Approved! Looks great for the campaign." },
  { author: "Паша М.", date: "2026-06-29", text: "Updated the CTA text per brief. Ready for review." },
]

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ brand: string; id: string }>
}) {
  const { brand, id } = await params
  const config = getBrand(brand)
  const asset = getAssetById(id)
  if (!config || !asset) notFound()

  const Icon = FORMAT_ICONS[asset.format]

  return (
    <div className="px-8 py-8">
      {/* Breadcrumb */}
      <Link
        href={`/brands/${brand}/assets`}
        className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-6"
      >
        <ChevronLeft size={14} /> Assets
      </Link>

      <div className="grid grid-cols-[1fr_320px] gap-8">
        {/* Left: preview */}
        <div>
          <div className="bg-white rounded-2xl border border-neutral-200 aspect-video flex items-center justify-center mb-4">
            <Icon size={48} className="text-neutral-200" />
          </div>
          {/* Comments */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">Comments</h3>
            <div className="flex flex-col gap-4">
              {MOCK_COMMENTS.map((c, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-neutral-200 shrink-0 flex items-center justify-center text-xs font-bold text-neutral-600">
                    {c.author[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-neutral-900">{c.author}</span>
                      <span className="text-[10px] text-neutral-400">{c.date}</span>
                    </div>
                    <p className="text-sm text-neutral-600">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: metadata */}
        <div className="flex flex-col gap-4">
          {/* Name + status */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h1 className="text-lg font-bold text-neutral-900 mb-2">{asset.name}</h1>
            <span className={`text-xs font-medium px-2 py-1 rounded ${STATUS_CLASS[asset.status]}`}>
              {asset.status}
            </span>
            <div className="mt-4 flex flex-col gap-2 text-sm text-neutral-600">
              {asset.dimensions && <div className="flex justify-between"><span className="text-neutral-400">Dimensions</span> {asset.dimensions}</div>}
              <div className="flex justify-between"><span className="text-neutral-400">Size</span> {asset.size}</div>
              <div className="flex justify-between"><span className="text-neutral-400">Format</span> {asset.format}</div>
              <div className="flex justify-between"><span className="text-neutral-400">Updated</span> {asset.updatedAt}</div>
              {asset.campaign && <div className="flex justify-between"><span className="text-neutral-400">Campaign</span> {asset.campaign}</div>}
            </div>
          </div>

          {/* Tags */}
          {asset.tags.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 mb-3">
                <Tag size={12} /> Tags
              </div>
              <div className="flex flex-wrap gap-1.5">
                {asset.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Versions */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 mb-3">
              <Clock size={12} /> Version History
            </div>
            <div className="flex flex-col gap-3">
              {MOCK_VERSIONS.slice(0, asset.versions).map((v, i) => (
                <div key={v.version} className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-neutral-900">{v.version}</span>
                      {i === 0 && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Current</span>}
                    </div>
                    <p className="text-[10px] text-neutral-400">{v.date} · {v.author}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{v.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Download */}
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors">
            <Download size={15} /> Download Original
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Verify in browser:** click any asset card from the grid, confirm detail page renders.

- [ ] **Commit**

```bash
git add app/brands/[brand]/assets/[id]/
git commit -m "feat: add asset detail page"
```

---

## Task 11: Collections Pages

**Files:**
- Create: `app/brands/[brand]/collections/page.tsx`
- Create: `app/brands/[brand]/collections/[id]/page.tsx`

- [ ] **Create `app/brands/[brand]/collections/page.tsx`**

```tsx
import { notFound } from "next/navigation"
import { getBrand } from "@/lib/brands"
import { getCollectionsByBrand } from "@/lib/mock-data"
import { CollectionCard } from "@/components/CollectionCard"

export default async function CollectionsPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params
  const config = getBrand(brand)
  if (!config) notFound()

  const collections = getCollectionsByBrand(config.slug)
  const external = collections.filter((c) => c.access === "EXTERNAL")
  const internal = collections.filter((c) => c.access === "INTERNAL")

  return (
    <div className="px-8 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Collections</h1>
        <p className="text-sm text-neutral-500 mt-1">Curated asset sets for sharing and internal use</p>
      </div>

      {external.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">External</h2>
          <div className="grid grid-cols-3 gap-4">
            {external.map((col) => (
              <CollectionCard key={col.id} collection={col} href={`/brands/${brand}/collections/${col.id}`} />
            ))}
          </div>
        </section>
      )}

      {internal.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">Internal</h2>
          <div className="grid grid-cols-3 gap-4">
            {internal.map((col) => (
              <CollectionCard key={col.id} collection={col} href={`/brands/${brand}/collections/${col.id}`} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
```

- [ ] **Create `app/brands/[brand]/collections/[id]/page.tsx`**

```tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import { getBrand } from "@/lib/brands"
import { getCollectionById, getAssetsByCollection } from "@/lib/mock-data"
import { AssetCard } from "@/components/AssetCard"
import { ChevronLeft, Share2, Globe, Lock } from "lucide-react"

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ brand: string; id: string }>
}) {
  const { brand, id } = await params
  const config = getBrand(brand)
  const collection = getCollectionById(id)
  if (!config || !collection) notFound()

  const assets = getAssetsByCollection(id)
  const portalUrl = `/portal/${collection.token}`

  return (
    <div className="px-8 py-8">
      <Link
        href={`/brands/${brand}/collections`}
        className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-6"
      >
        <ChevronLeft size={14} /> Collections
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-xl font-bold text-neutral-900">{collection.name}</h1>
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              collection.access === "EXTERNAL"
                ? "bg-green-50 text-green-700"
                : "bg-neutral-100 text-neutral-500"
            }`}>
              {collection.access === "EXTERNAL" ? <Globe size={10} /> : <Lock size={10} />}
              {collection.access}
            </span>
          </div>
          <p className="text-sm text-neutral-500">{collection.description}</p>
        </div>
        {collection.access === "EXTERNAL" && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-neutral-100 rounded-lg px-3 py-2">
              <span className="text-xs text-neutral-500 font-mono">/portal/{collection.token}</span>
            </div>
            <Link
              href={portalUrl}
              target="_blank"
              className="flex items-center gap-1.5 text-sm font-medium bg-neutral-900 text-white px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <Share2 size={13} /> Share Link
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            href={`/brands/${brand}/assets/${asset.id}`}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Commit**

```bash
git add app/brands/[brand]/collections/
git commit -m "feat: add collections list and detail pages"
```

---

## Task 12: Guidelines Page

**Files:**
- Create: `app/brands/[brand]/guidelines/page.tsx`

- [ ] **Create `app/brands/[brand]/guidelines/page.tsx`**

```tsx
import { notFound } from "next/navigation"
import { getBrand } from "@/lib/brands"
import { MOCK_GUIDELINES } from "@/lib/mock-data"
import { Download, CheckCircle2, XCircle } from "lucide-react"

export default async function GuidelinesPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params
  const config = getBrand(brand)
  if (!config) notFound()

  const guide = MOCK_GUIDELINES[config.slug]

  return (
    <div className="px-8 py-8 flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Brand Guidelines</h1>
        <p className="text-sm text-neutral-500 mt-1">{config.name} — official brand standards</p>
      </div>

      {/* Colors */}
      <section>
        <h2 className="text-base font-semibold text-neutral-900 mb-4">Colors</h2>
        <div className="flex gap-4 flex-wrap">
          {guide.colors.map((color) => (
            <div key={color.hex} className="flex flex-col items-center gap-2">
              <div
                className="w-20 h-20 rounded-xl border border-neutral-200 shadow-sm"
                style={{ backgroundColor: color.hex }}
              />
              <p className="text-xs font-medium text-neutral-900">{color.name}</p>
              <p className="text-[10px] text-neutral-400 font-mono">{color.hex}</p>
              {color.pantone && <p className="text-[10px] text-neutral-400">{color.pantone}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="text-base font-semibold text-neutral-900 mb-4">Typography</h2>
        <div className="flex flex-col gap-4">
          {guide.fonts.map((font) => (
            <div key={font.name} className="bg-white rounded-xl border border-neutral-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <p className="text-sm font-semibold text-neutral-900">{font.name}</p>
                <div className="flex gap-1">
                  {font.variants.map((v) => (
                    <span key={v} className="text-[10px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded">{v}</span>
                  ))}
                </div>
              </div>
              <p className="text-2xl font-medium text-neutral-900">{font.specimen}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Logos */}
      <section>
        <h2 className="text-base font-semibold text-neutral-900 mb-4">Logo Variants</h2>
        <div className="grid grid-cols-4 gap-4">
          {guide.logoVariants.map((logo) => (
            <div key={logo.name} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className={`h-24 flex items-center justify-center ${logo.background === 'dark' ? 'bg-neutral-900' : 'bg-neutral-50'}`}>
                <span className={`text-xs font-bold ${logo.background === 'dark' ? 'text-white' : 'text-neutral-900'}`}>
                  {config.name}
                </span>
              </div>
              <div className="p-3 flex items-center justify-between">
                <p className="text-[11px] text-neutral-600">{logo.name}</p>
                <button className="text-neutral-400 hover:text-neutral-700 transition-colors">
                  <Download size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Do / Don't */}
      <section>
        <h2 className="text-base font-semibold text-neutral-900 mb-4">Usage Rules</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-5">
            <p className="text-sm font-semibold text-green-800 mb-3">Do</p>
            <ul className="flex flex-col gap-2">
              {guide.doList.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-green-700">
                  <CheckCircle2 size={14} className="shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-50 rounded-xl p-5">
            <p className="text-sm font-semibold text-red-800 mb-3">Don't</p>
            <ul className="flex flex-col gap-2">
              {guide.dontList.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-red-700">
                  <XCircle size={14} className="shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Commit**

```bash
git add app/brands/[brand]/guidelines/
git commit -m "feat: add brand guidelines page"
```

---

## Task 13: External Portal

**Files:**
- Create: `app/portal/[token]/layout.tsx`
- Create: `app/portal/[token]/page.tsx`

- [ ] **Create `app/portal/[token]/layout.tsx`**

```tsx
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  )
}
```

- [ ] **Create `app/portal/[token]/page.tsx`**

```tsx
import { notFound } from "next/navigation"
import { getCollectionByToken, getAssetsByCollection } from "@/lib/mock-data"
import { getBrand } from "@/lib/brands"
import { Download, FileText, Video, Image, FileCode } from "lucide-react"
import type { AssetFormat } from "@/types/mock"

const FORMAT_ICONS: Record<AssetFormat, typeof Image> = {
  IMAGE: Image,
  VIDEO: Video,
  PDF: FileText,
  TEMPLATE: FileCode,
}

export default async function PortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const collection = getCollectionByToken(token)
  if (!collection || collection.access !== "EXTERNAL") notFound()

  const brand = getBrand(collection.brandSlug)
  const assets = getAssetsByCollection(collection.id).filter((a) => a.status === "APPROVED")

  return (
    <div className="max-w-[1100px] mx-auto px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-2xl text-white font-bold text-lg mb-4"
          style={{ backgroundColor: brand?.accent }}
        >
          {brand?.name?.[0] ?? "?"}
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">{brand?.name}</h1>
        <p className="text-neutral-500 mt-1">{collection.name}</p>
        <p className="text-sm text-neutral-400 mt-1 max-w-md mx-auto">{collection.description}</p>
      </div>

      {/* Asset grid */}
      <div className="grid grid-cols-3 gap-5">
        {assets.map((asset) => {
          const Icon = FORMAT_ICONS[asset.format]
          return (
            <div key={asset.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] bg-neutral-50 flex items-center justify-center">
                <Icon size={32} className="text-neutral-200" />
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-neutral-900 truncate mb-1">{asset.name}</p>
                <p className="text-xs text-neutral-400 mb-4">{asset.size} · {asset.format}</p>
                <button
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors"
                  style={{ borderColor: brand?.accent + "40" }}
                >
                  <Download size={14} /> Download
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="text-center mt-12 pt-8 border-t border-neutral-100">
        <p className="text-xs text-neutral-400">
          Powered by <span className="font-semibold text-neutral-600">update</span> · {collection.assetIds.length} assets in this collection
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Verify in browser:** open `localhost:3000/portal/ext-yp-brand`, confirm clean portal page with no sidebar, assets grid, download buttons.

- [ ] **Commit**

```bash
git add app/portal/
git commit -m "feat: add external portal for contractor asset sharing"
```

---

## Task 14: Final Polish + Smoke Test

- [ ] **Test full user flow as Admin:**
  1. `localhost:3000` → brand selector (4 cards)
  2. Click "Yango Play" → overview page (stats, recent assets, collections)
  3. "View all" assets → grid with filters, test search "banner"
  4. Click asset → detail with metadata, versions, comments
  5. Collections → collection detail → "Share Link" shows portal URL
  6. Portal URL → clean branded page, approved assets only

- [ ] **Test role switcher:**
  1. Switch to "Internal Viewer" → Upload button disappears from sidebar, Share Link button hides on collection detail (add guard using `canSharePortal`)
  2. Switch to "External Agency" → note that this role goes directly to portal

- [ ] **Add portal share guard to collection detail** — edit `app/brands/[brand]/collections/[id]/page.tsx`:

The Share Link section should be conditionally rendered. Since the collection detail is a Server Component, we need to pass it to a small Client Component or accept that in the prototype the role switcher is purely cosmetic for the Share button. For the prototype: wrap the share button in a client component.

Create `app/brands/[brand]/collections/[id]/ShareButton.tsx`:

```tsx
"use client"
import { useDemoRole, canSharePortal } from "@/lib/demo-role-context"
import Link from "next/link"
import { Share2 } from "lucide-react"

export function ShareButton({ token }: { token: string }) {
  const { demoRole } = useDemoRole()
  if (!canSharePortal(demoRole)) return null

  return (
    <Link
      href={`/portal/${token}`}
      target="_blank"
      className="flex items-center gap-1.5 text-sm font-medium bg-neutral-900 text-white px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
    >
      <Share2 size={13} /> Share Link
    </Link>
  )
}
```

Then in `app/brands/[brand]/collections/[id]/page.tsx`, replace the `<Link href={portalUrl}...>Share Link</Link>` button with `<ShareButton token={collection.token} />` and add the import.

- [ ] **Run build to catch TypeScript errors**

```bash
npm run build
```
Expected: build succeeds with no errors.

- [ ] **Final commit**

```bash
git add -A
git commit -m "feat: complete update brand content hub prototype"
```

---

## Quick Reference

| URL | What to show |
|---|---|
| `/` | Brand selector |
| `/brands/yango-play` | Yango Play overview |
| `/brands/yasmina/assets` | Asset grid + filters |
| `/brands/yango-music/assets/mu-2` | Asset detail (The Weeknd collab) |
| `/brands/yango-plus/collections` | Collections split by access |
| `/brands/yasmina/collections/ym-col-2` | Collection with Share button |
| `/portal/ext-ym-product` | Yasmina external portal |
| `/brands/yasmina/guidelines` | Guidelines page |
