export type OfferType = 'future' | 'current' | 'old';
export type Tariff = 'Basic' | 'Premium' | 'Crunchyroll';
export type Platform = 'iOS' | 'Android' | 'Native';

export const COUNTRIES = ['UAE', 'Egypt', 'Kuwait', 'Qatar', 'Oman', 'KSA', 'Bahrain'] as const;
export const TARIFFS: Tariff[] = ['Basic', 'Premium', 'Crunchyroll'];
export const PLATFORMS: Platform[] = ['iOS', 'Android', 'Native'];

export type Offer = {
  id: string;
  type: OfferType;
  date?: string;
  country: string;
  tariff: Tariff;
  platform: Platform;
  offerName: string;
  offerValue?: string;
  price?: string;
  duration?: string;
  promoCode?: string;
  description?: string;
  source: 'Google Sheet' | 'DataLens';
  dateFrom?: string;
  dateTo?: string;
  comment?: string;
  status?: string;
  lastUpdated?: string;
  buttonTextEn?: string;
  buttonTextAr?: string;
  disclaimerEn?: string;
  disclaimerAr?: string;
};

export type Period = '7d' | '30d' | '90d' | 'custom';

export type OfferFilters = {
  offerType: OfferType;
  countries: string[];
  tariff: Tariff | 'All';
  platform: Platform | 'All';
  period: Period;
  periodFrom?: string;
  periodTo?: string;
};

export const DEFAULT_FILTERS: OfferFilters = {
  offerType: 'current',
  countries: [],
  tariff: 'All',
  platform: 'All',
  period: '30d',
};
