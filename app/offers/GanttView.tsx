"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Offer, OfferFilters } from "@/lib/offers/types";
import { futureOffersAdapter, currentOffersAdapter, oldOffersAdapter } from "@/lib/offers/adapters";

// ─── Colors ───────────────────────────────────────────────────────────────────

export const KIND_COLORS: Record<string, string> = {
  'Music':   '#0d9488',
  'Play':    '#3b82f6',
  'Taxi':    '#eab308',
  'Yasmina': '#ec4899',
  'Plus':    '#8b5cf6',
  'Other':   '#6b7280',
};

const DAY_MS = 86_400_000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toTs(dateStr: string | undefined | null, fallback: number): number {
  if (!dateStr) return fallback;
  const ts = new Date(dateStr).getTime();
  return isNaN(ts) ? fallback : ts;
}

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
}

type GanttRow = {
  name: string;
  phantom: number;
  bar: number;
  offerKind: string;
  offer: Offer;
};

function makeRows(offers: Offer[], chartStart: number, today: number): GanttRow[] {
  return offers.map(o => {
    const start = toTs(o.dateFrom ?? o.date, today);
    const end   = toTs(o.dateTo, today);
    const safeEnd = end <= start ? start + DAY_MS : end;
    return {
      name:      `${o.country} · ${o.platform} · ${o.offerName}`,
      phantom:   Math.max(0, start - chartStart),
      bar:       Math.max(safeEnd - start, DAY_MS),
      offerKind: o.offerKind ?? 'Other',
      offer:     o,
    };
  });
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function GanttTooltip({ active, payload }: { active?: boolean; payload?: { payload: GanttRow }[] }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row?.offer) return null;
  const o = row.offer;
  const color = KIND_COLORS[o.offerKind ?? 'Other'] ?? '#6b7280';

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-xl p-3 text-sm min-w-[220px]">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
        <span className="font-semibold text-neutral-900 leading-snug">{o.offerName}</span>
      </div>
      <div className="text-xs text-neutral-500 mb-1">{o.country} · {o.platform} · {o.tariff}</div>
      {o.billingPeriod && (
        <div className="text-xs text-neutral-400 mb-1">{o.billingPeriod}</div>
      )}
      {(o.price || o.offerValue) && (
        <div className="text-xs font-medium text-neutral-700 mb-1">
          {o.offerValue ?? [o.price, o.duration].filter(Boolean).join(' · ')}
        </div>
      )}
      <div className="text-xs text-neutral-400 border-t border-neutral-100 pt-1 mt-1">
        {o.dateFrom ?? '?'} → {o.dateTo ?? 'ongoing'}
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function GanttSection({
  title,
  accent,
  rows,
  chartStart,
  chartEnd,
  today,
  onSelectOffer,
  collapsible = false,
  defaultExpanded = true,
}: {
  title: string;
  accent: string;
  rows: GanttRow[];
  chartStart: number;
  chartEnd: number;
  today: number;
  onSelectOffer: (o: Offer) => void;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const totalMs     = chartEnd - chartStart;
  const todayOffset = today - chartStart;
  const chartHeight = Math.max(rows.length * 44 + 56, 80);

  const tickFormatter = (value: number) => fmtDate(chartStart + value);

  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <button
        className={`flex items-center gap-2 w-fit ${collapsible ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-default'}`}
        onClick={collapsible ? () => setExpanded(v => !v) : undefined}
        disabled={!collapsible}
      >
        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: accent }} />
        <span className="text-sm font-bold text-neutral-800">{title}</span>
        <span className="text-xs text-neutral-400 font-normal">{rows.length} offers</span>
        {collapsible && (
          expanded
            ? <ChevronDown size={13} className="text-neutral-400" />
            : <ChevronRight size={13} className="text-neutral-400" />
        )}
      </button>

      {/* Chart */}
      {expanded && (
        <div className="rounded-xl border border-neutral-100 bg-white overflow-hidden">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              layout="vertical"
              data={rows}
              margin={{ top: 8, right: 24, bottom: 24, left: 0 }}
              barSize={18}
            >
              <XAxis
                type="number"
                domain={[0, totalMs]}
                tickFormatter={tickFormatter}
                tickCount={7}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={220}
                tick={{ fontSize: 10, fill: '#374151' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<GanttTooltip />}
                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              />
              {/* Today reference line */}
              {todayOffset > 0 && todayOffset < totalMs && (
                <ReferenceLine
                  x={todayOffset}
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  label={{ value: 'Today', position: 'insideTopLeft', fontSize: 9, fill: '#ef4444', offset: 4 }}
                />
              )}
              {/* Transparent spacer (phantom) */}
              <Bar dataKey="phantom" stackId="g" fill="transparent" isAnimationActive={false} />
              {/* Colored offer bar */}
              <Bar
                dataKey="bar"
                stackId="g"
                radius={[3, 3, 3, 3]}
                isAnimationActive={false}
                cursor="pointer"
                onClick={(entry: unknown) => {
                  const row = (entry as { payload?: GanttRow }).payload;
                  if (row?.offer) onSelectOffer(row.offer);
                }}
              >
                {rows.map((row, i) => (
                  <Cell key={i} fill={KIND_COLORS[row.offerKind] ?? '#6b7280'} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function GanttView({
  filters,
  onSelectOffer,
}: {
  filters: OfferFilters;
  onSelectOffer: (o: Offer) => void;
}) {
  const [futureOffers,  setFutureOffers]  = useState<Offer[]>([]);
  const [currentOffers, setCurrentOffers] = useState<Offer[]>([]);
  const [oldOffers,     setOldOffers]     = useState<Offer[]>([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      futureOffersAdapter({ ...filters, offerType: 'future' }),
      currentOffersAdapter({ ...filters, offerType: 'current' }),
      oldOffersAdapter({ ...filters, offerType: 'old' }),
    ]).then(([f, c, o]) => {
      if (cancelled) return;
      setFutureOffers(f);
      setCurrentOffers(c);
      setOldOffers(o);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [filters]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-xl border border-neutral-100 overflow-hidden animate-pulse">
            <div className="h-8 bg-neutral-50 mb-2" />
            <div className="h-40 bg-white" />
          </div>
        ))}
      </div>
    );
  }

  const today      = Date.now();
  const allOffers  = [...futureOffers, ...currentOffers, ...oldOffers];

  if (allOffers.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-neutral-500">No offers found for the selected filters.</p>
      </div>
    );
  }

  const getStart = (o: Offer) => toTs(o.dateFrom ?? o.date, today);
  // For offers without dateTo, use dateFrom + 30 days as a proxy for chartEnd calculation
  const getEndForDomain = (o: Offer) =>
    o.dateTo ? toTs(o.dateTo, today) : getStart(o) + 30 * DAY_MS;

  const chartStart = Math.min(...allOffers.map(getStart)) - 7 * DAY_MS;
  const chartEnd   = Math.max(...allOffers.map(getEndForDomain), today) + 14 * DAY_MS;

  const futureRows  = makeRows(futureOffers,  chartStart, today);
  const currentRows = makeRows(currentOffers, chartStart, today);
  const oldRows     = makeRows(oldOffers,     chartStart, today);

  return (
    <div className="flex flex-col gap-6">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4">
        {Object.entries(KIND_COLORS).map(([kind, color]) => (
          <div key={kind} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
            <span className="text-xs text-neutral-500">{kind}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-neutral-200">
          <div className="w-6 border-t-2 border-dashed border-red-400" />
          <span className="text-xs text-neutral-500">Today</span>
        </div>
      </div>

      {/* Sections */}
      <GanttSection
        title="Future Offers"
        accent="#3b82f6"
        rows={futureRows}
        chartStart={chartStart}
        chartEnd={chartEnd}
        today={today}
        onSelectOffer={onSelectOffer}
      />
      <GanttSection
        title="Current Offers"
        accent="#10b981"
        rows={currentRows}
        chartStart={chartStart}
        chartEnd={chartEnd}
        today={today}
        onSelectOffer={onSelectOffer}
      />
      <GanttSection
        title="Old Offers"
        accent="#6b7280"
        rows={oldRows}
        chartStart={chartStart}
        chartEnd={chartEnd}
        today={today}
        onSelectOffer={onSelectOffer}
        collapsible
        defaultExpanded={false}
      />
    </div>
  );
}
