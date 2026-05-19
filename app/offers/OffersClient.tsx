"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Check, Calendar, Copy, Check as CheckIcon } from "lucide-react";
import type { Offer, OfferFilters, Tariff, Platform, Period } from "@/lib/offers/types";
import { COUNTRIES, TARIFFS, PLATFORMS, DEFAULT_FILTERS } from "@/lib/offers/types";
import { futureOffersAdapter, currentOffersAdapter, oldOffersAdapter } from "@/lib/offers/adapters";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function groupByDate(offers: Offer[]): Map<string, Offer[]> {
  const map = new Map<string, Offer[]>();
  const sorted = [...offers].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  for (const o of sorted) {
    const key = o.date ?? 'Unknown';
    map.set(key, [...(map.get(key) ?? []), o]);
  }
  return map;
}

function groupByTariff(offers: Offer[]): Map<Tariff, Offer[]> {
  const map = new Map<Tariff, Offer[]>();
  for (const t of TARIFFS) {
    const group = offers.filter(o => o.tariff === t);
    if (group.length) map.set(t, group);
  }
  return map;
}


function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

function formatPlannedDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  } catch { return iso; }
}

// ─── Multiselect ─────────────────────────────────────────────────────────────

function CountryMultiselect({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const toggle = (country: string) => {
    onChange(value.includes(country) ? value.filter(c => c !== country) : [...value, country]);
  };

  const label = value.length === 0 ? 'All countries' : value.length === 1 ? value[0] : `${value.length} countries`;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-sm rounded-xl border transition-all min-w-[160px] justify-between ${
          value.length > 0 ? 'border-neutral-400 bg-neutral-50 text-neutral-900' : 'border-neutral-200 bg-white text-neutral-500'
        }`}
      >
        <span>{label}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute top-full left-0 mt-1 bg-white rounded-xl border border-neutral-200 shadow-lg z-20 min-w-[180px] py-1"
          >
            <button
              onClick={() => onChange([])}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50 transition-colors"
            >
              <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${value.length === 0 ? 'bg-neutral-900 border-neutral-900' : 'border-neutral-300'}`}>
                {value.length === 0 && <Check size={10} className="text-white" />}
              </span>
              All countries
            </button>
            <div className="h-px bg-neutral-100 mx-2 my-1" />
            {COUNTRIES.map(c => (
              <button
                key={c}
                onClick={() => toggle(c)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50 transition-colors"
              >
                <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${value.includes(c) ? 'bg-neutral-900 border-neutral-900' : 'border-neutral-300'}`}>
                  {value.includes(c) && <Check size={10} className="text-white" />}
                </span>
                {c}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Copy Cell ───────────────────────────────────────────────────────────────

function CopyCell({ text, rtl }: { text?: string | null; rtl?: boolean }) {
  const [copied, setCopied] = useState(false);
  if (!text) return <span className="text-neutral-300 text-xs">—</span>;
  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className={`group/copy flex items-start gap-1.5 ${rtl ? 'flex-row-reverse' : ''}`}>
      <span className={`flex-1 text-xs text-neutral-700 leading-snug ${rtl ? 'text-right' : ''}`} dir={rtl ? 'rtl' : undefined}>{text}</span>
      <button
        onClick={copy}
        className="shrink-0 p-0.5 rounded text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100 transition-colors opacity-0 group-hover/copy:opacity-100"
        title="Copy"
      >
        {copied ? <CheckIcon size={11} className="text-green-500" /> : <Copy size={11} />}
      </button>
    </div>
  );
}

// ─── Tariff Table ─────────────────────────────────────────────────────────────

function TariffTable({
  tariff, offers, platformFilter, activeCountries, onSelectOffer,
}: {
  tariff: Tariff;
  offers: Offer[];
  platformFilter: Platform | 'All';
  activeCountries: string[];
  onSelectOffer: (o: Offer) => void;
}) {
  const rows = offers
    .filter(o => {
      if (activeCountries.length > 0 && !activeCountries.includes(o.country)) return false;
      if (platformFilter !== 'All' && o.platform !== platformFilter) return false;
      return true;
    })
    .sort((a, b) => a.country.localeCompare(b.country) || a.platform.localeCompare(b.platform));

  if (rows.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-bold text-neutral-900 mb-2 px-1">{tariff}</h3>
      <div className="rounded-xl border border-neutral-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-100">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-400 uppercase tracking-wide w-28">Country</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-400 uppercase tracking-wide">Offer</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-400 uppercase tracking-wide">Button EN</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-400 uppercase tracking-wide">Under btn EN</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-neutral-400 uppercase tracking-wide">Button AR</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-neutral-400 uppercase tracking-wide">Under btn AR</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-400 uppercase tracking-wide w-36">Dates</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((offer, i) => {
              const dateRange = [offer.dateFrom, offer.dateTo].filter(Boolean).join(' – ');
              return (
                <tr key={offer.id} className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-50/40'}>
                  <td className="px-4 py-3 align-top">
                    <span className="block text-sm font-medium text-neutral-700">{offer.country}</span>
                    <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500">{offer.platform}</span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <button onClick={() => onSelectOffer(offer)} className="text-left group">
                      <span className="block text-xs font-semibold text-neutral-800 group-hover:text-blue-700 transition-colors leading-snug">
                        {offer.offerName}
                      </span>
                      {(offer.offerValue || offer.price) && (
                        <span className="block text-[11px] text-neutral-400 mt-0.5">
                          {offer.offerValue || [offer.price, offer.duration].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 align-top max-w-[200px]">
                    <CopyCell text={offer.buttonTextEn} />
                  </td>
                  <td className="px-4 py-3 align-top max-w-[200px]">
                    <CopyCell text={offer.disclaimerEn} />
                  </td>
                  <td className="px-4 py-3 align-top max-w-[200px]">
                    <CopyCell text={offer.buttonTextAr} rtl />
                  </td>
                  <td className="px-4 py-3 align-top max-w-[200px]">
                    <CopyCell text={offer.disclaimerAr} rtl />
                  </td>
                  <td className="px-4 py-3 align-top text-[11px] text-neutral-500 whitespace-nowrap">
                    {dateRange || offer.date || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Offer Drawer ─────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-neutral-900 leading-snug">{value}</span>
    </div>
  );
}

function OfferDrawer({ offer, onClose }: { offer: Offer | null; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {offer && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />
          <motion.div
            key="drawer"
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-[400px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-neutral-100">
              <div>
                <div className="flex gap-2 mb-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 font-medium">{offer.tariff}</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 font-medium">{offer.platform}</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 font-medium">{offer.country}</span>
                </div>
                <h2 className="text-base font-bold text-neutral-900 leading-snug">{offer.offerName}</h2>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors shrink-0">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
              {/* Price / Duration highlight */}
              {(offer.price || offer.duration) && (
                <div className="flex gap-4 p-4 bg-neutral-50 rounded-xl">
                  {offer.price && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">Price</span>
                      <span className="text-lg font-bold text-neutral-900">{offer.price}</span>
                    </div>
                  )}
                  {offer.duration && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">Duration</span>
                      <span className="text-lg font-bold text-neutral-900">{offer.duration}</span>
                    </div>
                  )}
                </div>
              )}

              {(offer.buttonTextEn || offer.buttonTextAr || offer.disclaimerEn || offer.disclaimerAr) && (
                <div className="flex flex-col gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Button Copy</span>
                  {offer.buttonTextEn && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">Button Text (EN)</span>
                      <span className="text-sm font-medium text-neutral-900">{offer.buttonTextEn}</span>
                    </div>
                  )}
                  {offer.buttonTextAr && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">Button Text (AR)</span>
                      <span className="text-sm font-medium text-neutral-900 text-right" dir="rtl">{offer.buttonTextAr}</span>
                    </div>
                  )}
                  {offer.disclaimerEn && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">Under Button (EN)</span>
                      <span className="text-sm text-neutral-700">{offer.disclaimerEn}</span>
                    </div>
                  )}
                  {offer.disclaimerAr && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wide">Under Button (AR)</span>
                      <span className="text-sm text-neutral-700 text-right" dir="rtl">{offer.disclaimerAr}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3.5">
                <DetailRow label="Offer Value" value={offer.offerValue} />
                <DetailRow label="Promo Code" value={offer.promoCode} />
                <DetailRow label="Description" value={offer.description} />
                <DetailRow label="Comment" value={offer.comment} />
              </div>

              <div className="h-px bg-neutral-100" />

              <div className="flex flex-col gap-3.5">
                <DetailRow label="Status" value={offer.status} />
                <DetailRow label="Source" value={offer.source} />
                {offer.date && <DetailRow label="Planned Date" value={formatDate(offer.date)} />}
                <DetailRow label="Date From" value={offer.dateFrom ? formatDate(offer.dateFrom) : undefined} />
                <DetailRow label="Date To" value={offer.dateTo ? formatDate(offer.dateTo) : undefined} />
                <DetailRow label="Last Updated" value={offer.lastUpdated ? formatDate(offer.lastUpdated) : undefined} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Offers Table ─────────────────────────────────────────────────────────────

function OffersTable({
  offers, filters, loading, error, onSelectOffer,
}: {
  offers: Offer[];
  filters: OfferFilters;
  loading: boolean;
  error: string | null;
  onSelectOffer: (o: Offer) => void;
}) {
  const activeCountries = filters.countries.length > 0 ? filters.countries : [...COUNTRIES];

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map(i => (
          <div key={i} className="rounded-xl border border-neutral-100 overflow-hidden animate-pulse">
            <div className="bg-neutral-50 h-10" />
            {[1, 2, 3].map(j => <div key={j} className="h-12 border-t border-neutral-50 bg-white" />)}
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-neutral-500">No offers found for the selected filters.</p>
      </div>
    );
  }

  if (filters.offerType === 'future') {
    const byDate = groupByDate(offers);
    return (
      <div className="flex flex-col gap-8">
        {[...byDate.entries()].map(([date, dateOffers]) => {
          const byTariff = groupByTariff(dateOffers);
          return (
            <div key={date} className="flex flex-col gap-5">
              <div className="flex items-center gap-2.5 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl w-fit">
                <Calendar size={14} className="text-blue-500 shrink-0" />
                <span className="text-sm text-blue-700">
                  Planned change date:{' '}
                  <span className="font-bold text-blue-900">{formatPlannedDate(date)}</span>
                </span>
              </div>
              <div className="flex flex-col gap-5">
                {[...byTariff.entries()].map(([tariff, tariffOffers]) => (
                  <TariffTable
                    key={tariff}
                    tariff={tariff}
                    offers={tariffOffers}
                    platformFilter={filters.platform}
                    activeCountries={activeCountries}
                    onSelectOffer={onSelectOffer}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const byTariff = groupByTariff(offers);
  return (
    <div className="flex flex-col gap-6">
      {[...byTariff.entries()].map(([tariff, tariffOffers]) => (
        <TariffTable
          key={tariff}
          tariff={tariff}
          offers={tariffOffers}
          platformFilter={filters.platform}
          activeCountries={activeCountries}
          onSelectOffer={onSelectOffer}
        />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const selectClass = "px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 bg-white focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 outline-none transition-all";

export function OffersClient() {
  const [filters, setFilters] = useState<OfferFilters>(DEFAULT_FILTERS);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Offer | null>(null);

  const updateFilters = useCallback((patch: Partial<OfferFilters>) => {
    setFilters(prev => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const adapter =
      filters.offerType === 'future' ? futureOffersAdapter :
      filters.offerType === 'current' ? currentOffersAdapter :
      oldOffersAdapter;

    adapter(filters)
      .then(data => { if (!cancelled) { setOffers(data); setLoading(false); } })
      .catch(() => { if (!cancelled) { setError('Could not load offers data. Please check the source connection.'); setLoading(false); } });

    return () => { cancelled = true; };
  }, [filters]);

  const TYPE_TABS: { key: OffersClient.OfferTypeKey; label: string }[] = [
    { key: 'future',  label: 'Future Offers' },
    { key: 'current', label: 'Current Offers' },
    { key: 'old',     label: 'Old Offers' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Offers</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Subscription offers by country, tariff and platform</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        {/* Offer type tabs */}
        <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl w-fit">
          {TYPE_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => updateFilters({ offerType: key as OfferFilters['offerType'] })}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                filters.offerType === key
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Secondary filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <CountryMultiselect
            value={filters.countries}
            onChange={countries => updateFilters({ countries })}
          />
          <select
            value={filters.tariff}
            onChange={e => updateFilters({ tariff: e.target.value as Tariff | 'All' })}
            className={selectClass}
          >
            <option value="All">All tariffs</option>
            {TARIFFS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={filters.platform}
            onChange={e => updateFilters({ platform: e.target.value as Platform | 'All' })}
            className={selectClass}
          >
            <option value="All">All platforms</option>
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          {/* Period filter — only for old offers */}
          {filters.offerType === 'old' && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl">
                {(['7d', '30d', '90d', 'custom'] as Period[]).map(p => (
                  <button
                    key={p}
                    onClick={() => updateFilters({ period: p })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      filters.period === p
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    {p === '7d' ? 'Last 7d' : p === '30d' ? 'Last 30d' : p === '90d' ? 'Last 90d' : 'Custom'}
                  </button>
                ))}
              </div>
              {filters.period === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filters.periodFrom ?? ''}
                    onChange={e => updateFilters({ periodFrom: e.target.value })}
                    className={`${selectClass} text-xs py-2`}
                  />
                  <span className="text-neutral-400 text-xs">—</span>
                  <input
                    type="date"
                    value={filters.periodTo ?? ''}
                    onChange={e => updateFilters({ periodTo: e.target.value })}
                    className={`${selectClass} text-xs py-2`}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <OffersTable
        offers={offers}
        filters={filters}
        loading={loading}
        error={error}
        onSelectOffer={setSelected}
      />

      {/* Drawer */}
      <OfferDrawer offer={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace OffersClient {
  export type OfferTypeKey = 'future' | 'current' | 'old';
}
