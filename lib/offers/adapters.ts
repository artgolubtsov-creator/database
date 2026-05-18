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

// ─── Future Offers ────────────────────────────────────────────────────────────
// TODO: Replace mock with Google Sheet API call:
//   const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`);
//   const raw = await res.json();
//   return mapSheetRowsToOffers(raw.values);
export async function futureOffersAdapter(filters: OfferFilters): Promise<Offer[]> {
  const today = new Date().toISOString().slice(0, 10);
  const offers = MOCK_FUTURE_OFFERS.filter(o => o.date && o.date > today);
  return applyCommonFilters(offers, filters);
}

// ─── Current Offers ───────────────────────────────────────────────────────────
// TODO: Replace mock with DataLens API call:
//   const res = await fetch(`${DATALENS_ENDPOINT}/current-offers`, { headers: { Authorization: `Bearer ${TOKEN}` } });
//   const raw = await res.json();
//   return mapDataLensRowsToOffers(raw, 'current');
export async function currentOffersAdapter(filters: OfferFilters): Promise<Offer[]> {
  return applyCommonFilters(MOCK_CURRENT_OFFERS, filters);
}

// ─── Old Offers ───────────────────────────────────────────────────────────────
// TODO: Replace mock with DataLens API call:
//   const res = await fetch(`${DATALENS_ENDPOINT}/old-offers?from=${dateFrom}&to=${dateTo}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
//   const raw = await res.json();
//   return mapDataLensRowsToOffers(raw, 'old');
export async function oldOffersAdapter(filters: OfferFilters): Promise<Offer[]> {
  let offers = [...MOCK_OLD_OFFERS];

  const today = new Date();
  let cutoff: Date | null = null;

  if (filters.period === '7d')  cutoff = new Date(today.getTime() - 7  * 86400_000);
  if (filters.period === '30d') cutoff = new Date(today.getTime() - 30 * 86400_000);
  if (filters.period === '90d') cutoff = new Date(today.getTime() - 90 * 86400_000);
  if (filters.period === 'custom' && filters.periodFrom) {
    cutoff = new Date(filters.periodFrom);
  }

  if (cutoff) {
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const toStr = filters.period === 'custom' && filters.periodTo ? filters.periodTo : today.toISOString().slice(0, 10);
    offers = offers.filter(o => {
      const d = o.dateTo ?? o.dateFrom ?? '';
      return d >= cutoffStr && d <= toStr;
    });
  }

  return applyCommonFilters(offers, filters);
}
