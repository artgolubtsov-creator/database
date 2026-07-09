export type BrandSlug = 'yango-play' | 'yasmina' | 'yango-music' | 'yango-plus' | 'yango-taxi'
export type AssetFormat = 'IMAGE' | 'VIDEO' | 'PDF' | 'TEMPLATE'
export type AssetStatus = 'APPROVED' | 'REVIEW' | 'DRAFT' | 'ARCHIVED'
export type CollectionAccess = 'INTERNAL' | 'EXTERNAL'
export type DemoRole = 'Админ' | 'Супер Едитор' | 'Редактор' | 'Маркетинг'

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
