import type { Offer, OfferFilters } from './types';
import { MOCK_FUTURE_OFFERS, MOCK_CURRENT_OFFERS, MOCK_OLD_OFFERS } from './mock-data';

function applyCommonFilters(offers: Offer[], filters: OfferFilters): Offer[] {
  return offers.filter(o => {
    if (filters.countries.length > 0 && !filters.countries.includes(o.country)) return false;
    if (filters.tariff !== 'All' && o.tariff !== filters.tariff) return false;
    if (filters.platform !== 'All' && o.platform !== filters.platform) return false;
    return true;
  });
}

async function fetchDbOffers(type: string, filters: OfferFilters): Promise<Offer[]> {
  try {
    const params = new URLSearchParams({ type });
    if (filters.countries.length === 1) params.set('country', filters.countries[0]);
    if (filters.tariff  !== 'All') params.set('tariff',   filters.tariff);
    if (filters.platform !== 'All') params.set('platform', filters.platform);

    const res = await fetch(`/api/offers?${params}`);
    if (!res.ok) return [];
    const rows = await res.json();
    return rows.map((r: Record<string, string>) => ({ ...r, type } as Offer));
  } catch {
    return [];
  }
}

function mergeOffers(dbOffers: Offer[], mockOffers: Offer[]): Offer[] {
  const dbKeys = new Set(dbOffers.map(o => `${o.country}|${o.tariff}|${o.platform}`));
  return [...dbOffers, ...mockOffers.filter(o => !dbKeys.has(`${o.country}|${o.tariff}|${o.platform}`))];
}

// ─── Future Offers ────────────────────────────────────────────────────────────
// TODO: Replace mock with Google Sheet API call:
//   const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`);
export async function futureOffersAdapter(filters: OfferFilters): Promise<Offer[]> {
  const today = new Date().toISOString().slice(0, 10);
  const mock  = applyCommonFilters(MOCK_FUTURE_OFFERS.filter(o => o.date && o.date > today), filters);
  const db    = await fetchDbOffers('future', filters);
  return applyCommonFilters(mergeOffers(db, mock), { ...filters, countries: [], tariff: 'All', platform: 'All' });
}

// ─── Current Offers ───────────────────────────────────────────────────────────
// TODO: Replace mock with DataLens API call:
//   const res = await fetch(`${DATALENS_ENDPOINT}/current-offers`, { headers: { Authorization: `Bearer ${TOKEN}` } });
export async function currentOffersAdapter(filters: OfferFilters): Promise<Offer[]> {
  const mock = applyCommonFilters(MOCK_CURRENT_OFFERS, filters);
  const db   = await fetchDbOffers('current', filters);
  return applyCommonFilters(mergeOffers(db, mock), { ...filters, countries: [], tariff: 'All', platform: 'All' });
}

// ─── Old Offers ───────────────────────────────────────────────────────────────
// TODO: Replace mock with DataLens API call:
//   const res = await fetch(`${DATALENS_ENDPOINT}/old-offers?from=${dateFrom}&to=${dateTo}`, ...);
export async function oldOffersAdapter(filters: OfferFilters): Promise<Offer[]> {
  let mock = [...MOCK_OLD_OFFERS];

  const today = new Date();
  let cutoff: Date | null = null;
  if (filters.period === '7d')  cutoff = new Date(today.getTime() - 7  * 86400_000);
  if (filters.period === '30d') cutoff = new Date(today.getTime() - 30 * 86400_000);
  if (filters.period === '90d') cutoff = new Date(today.getTime() - 90 * 86400_000);
  if (filters.period === 'custom' && filters.periodFrom) cutoff = new Date(filters.periodFrom);

  if (cutoff) {
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const toStr = filters.period === 'custom' && filters.periodTo ? filters.periodTo : today.toISOString().slice(0, 10);
    mock = mock.filter(o => { const d = o.dateTo ?? o.dateFrom ?? ''; return d >= cutoffStr && d <= toStr; });
  }

  const db = await fetchDbOffers('old', filters);
  return applyCommonFilters(mergeOffers(db, mock), { ...filters, countries: [], tariff: 'All', platform: 'All' });
}
