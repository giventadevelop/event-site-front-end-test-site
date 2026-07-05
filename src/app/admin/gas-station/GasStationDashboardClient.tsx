'use client';

import { useMemo, useState, useTransition } from 'react';
import type {
  GasStationLocationDTO,
  GasStationDailyMetricsDTO,
  GasStationRecommendationDTO,
  GasStationRecommendationStatus,
} from '@/types/gasStation';
import {
  fetchGasStationDailyMetricsServer,
  fetchGasStationRecommendationsServer,
  updateGasStationRecommendationServer,
} from './ApiServerActions';

interface Props {
  initialDate: string;
  stations: GasStationLocationDTO[];
  initialMetrics: GasStationDailyMetricsDTO[];
  initialRecommendations: GasStationRecommendationDTO[];
}

const CATEGORY_STYLES: Record<string, string> = {
  FUEL_PRICING: 'bg-orange-100 text-orange-800',
  ORDERING: 'bg-blue-100 text-blue-800',
  STAFFING: 'bg-indigo-100 text-indigo-800',
  INVENTORY: 'bg-cyan-100 text-cyan-800',
  LOSS_PREVENTION: 'bg-red-100 text-red-800',
  MAINTENANCE: 'bg-amber-100 text-amber-800',
  ANOMALY: 'bg-rose-100 text-rose-800',
  COMPLIANCE: 'bg-slate-200 text-slate-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

const STATUS_STYLES: Record<string, string> = {
  NEW: 'bg-blue-50 text-blue-700 border-blue-200',
  VIEWED: 'bg-gray-50 text-gray-700 border-gray-200',
  ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DISMISSED: 'bg-gray-100 text-gray-500 border-gray-200',
  COMPLETED: 'bg-green-50 text-green-700 border-green-200',
};

function formatUsd(value?: number | null): string {
  if (value == null) return '—';
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function categoryLabel(category: string): string {
  return category.replaceAll('_', ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase());
}

export default function GasStationDashboardClient({
  initialDate,
  stations,
  initialMetrics,
  initialRecommendations,
}: Props) {
  const [date, setDate] = useState(initialDate);
  const [stationFilter, setStationFilter] = useState<'all' | number>(
    stations.length === 1 && stations[0].id != null ? stations[0].id : 'all'
  );
  const [metrics, setMetrics] = useState(initialMetrics);
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<number, string>>({});
  const [isPending, startTransition] = useTransition();

  const stationById = useMemo(() => {
    const map = new Map<number, GasStationLocationDTO>();
    for (const s of stations) if (s.id != null) map.set(s.id, s);
    return map;
  }, [stations]);

  const loadDate = (newDate: string) => {
    setDate(newDate);
    startTransition(async () => {
      const [m, r] = await Promise.all([
        fetchGasStationDailyMetricsServer(newDate),
        fetchGasStationRecommendationsServer(newDate),
      ]);
      setMetrics(m);
      setRecommendations(r);
    });
  };

  const visibleMetrics = useMemo(
    () => (stationFilter === 'all' ? metrics : metrics.filter((m) => m.stationId === stationFilter)),
    [metrics, stationFilter]
  );

  const headline = useMemo(() => {
    const sum = (pick: (m: GasStationDailyMetricsDTO) => number | undefined) =>
      visibleMetrics.reduce((acc, m) => acc + (pick(m) ?? 0), 0);
    return {
      expectedProfit: sum((m) => m.expectedProfitUsd),
      fuelGallons: sum((m) => m.fuelGallonsSold),
      inStoreSales: sum((m) => m.inStoreSalesUsd),
      laborCost: sum((m) => m.laborCostUsd),
      wasteCost: sum((m) => (m.wasteCostUsd ?? 0) + (m.shrinkCostUsd ?? 0)),
      hasData: visibleMetrics.length > 0,
    };
  }, [visibleMetrics]);

  const { chainRecs, stationGroups } = useMemo(() => {
    const relevant =
      stationFilter === 'all'
        ? recommendations
        : recommendations.filter((r) => r.stationId === stationFilter);
    const chain = relevant.filter((r) => r.stationId == null);
    const byStation = new Map<number, GasStationRecommendationDTO[]>();
    for (const rec of relevant) {
      if (rec.stationId == null) continue;
      const list = byStation.get(rec.stationId) ?? [];
      list.push(rec);
      byStation.set(rec.stationId, list);
    }
    // Rank station groups by total estimated impact, descending
    const groups = [...byStation.entries()].sort((a, b) => {
      const impact = (list: GasStationRecommendationDTO[]) =>
        list.reduce((acc, r) => acc + (r.estimatedImpactUsd ?? 0), 0);
      return impact(b[1]) - impact(a[1]);
    });
    return { chainRecs: chain, stationGroups: groups };
  }, [recommendations, stationFilter]);

  const updateStatus = (rec: GasStationRecommendationDTO, status: GasStationRecommendationStatus) => {
    if (rec.id == null) return;
    const id = rec.id;
    const ownerFeedback = feedbackDrafts[id]?.trim() || undefined;
    startTransition(async () => {
      const updated = await updateGasStationRecommendationServer(id, { status, ownerFeedback });
      if (updated) {
        setRecommendations((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
      }
    });
  };

  const renderRecCard = (rec: GasStationRecommendationDTO) => {
    const expanded = expandedId === rec.id;
    return (
      <div
        key={rec.id}
        className={`border rounded-lg p-4 ${STATUS_STYLES[rec.status ?? 'NEW'] ?? 'bg-white border-gray-200'}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1 min-w-[240px]">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${CATEGORY_STYLES[rec.category] ?? CATEGORY_STYLES.OTHER}`}
              >
                {categoryLabel(rec.category)}
              </span>
              {rec.stationId == null && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-800">
                  Chain-level
                </span>
              )}
              <span className="text-xs text-gray-500">{rec.status ?? 'NEW'}</span>
            </div>
            <p className="mt-2 font-medium text-gray-900">{rec.title}</p>
            {rec.detail && <p className="mt-1 text-sm text-gray-600">{rec.detail}</p>}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{formatUsd(rec.estimatedImpactUsd)}</p>
            <p className="text-xs text-gray-500">est. impact</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setExpandedId(expanded ? null : rec.id ?? null)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {expanded ? 'Hide details' : 'Why am I being told this?'}
          </button>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              disabled={isPending || rec.status === 'ACCEPTED'}
              onClick={() => updateStatus(rec, 'ACCEPTED')}
              className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-sm font-semibold disabled:opacity-50"
            >
              Accept
            </button>
            <button
              type="button"
              disabled={isPending || rec.status === 'DISMISSED'}
              onClick={() => updateStatus(rec, 'DISMISSED')}
              className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold disabled:opacity-50"
            >
              Dismiss
            </button>
            <button
              type="button"
              disabled={isPending || rec.status === 'COMPLETED'}
              onClick={() => updateStatus(rec, 'COMPLETED')}
              className="px-3 py-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 text-sm font-semibold disabled:opacity-50"
            >
              Done
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 border-t border-gray-200 pt-3 space-y-3">
            <p className="text-sm text-gray-700">
              {rec.explanation || 'No explanation provided by the AI engine for this recommendation.'}
            </p>
            {rec.confidencePct != null && (
              <p className="text-xs text-gray-500">Confidence: {rec.confidencePct}%</p>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Feedback to the AI engine (stored with Accept / Dismiss / Done)
              </label>
              <textarea
                rows={2}
                value={feedbackDrafts[rec.id ?? -1] ?? rec.ownerFeedback ?? ''}
                onChange={(e) =>
                  setFeedbackDrafts((prev) => ({ ...prev, [rec.id ?? -1]: e.target.value }))
                }
                className="block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g. Milk demand is up because of the school event this week"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brief date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => loadDate(e.target.value)}
            className="border border-gray-400 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        {stations.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Station</label>
            <select
              value={stationFilter === 'all' ? 'all' : String(stationFilter)}
              onChange={(e) =>
                setStationFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="border border-gray-400 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All stations ({stations.length})</option>
              {stations.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.stationCode} — {s.stationName}
                </option>
              ))}
            </select>
          </div>
        )}
        {isPending && <span className="text-sm text-gray-500 pb-2">Loading…</span>}
      </div>

      {/* Headline metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 md:col-span-1 col-span-2">
          <p className="text-sm text-gray-500">Today&apos;s expected profit</p>
          <p className="text-2xl font-bold text-emerald-600">
            {headline.hasData ? formatUsd(headline.expectedProfit) : '—'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500">Fuel gallons</p>
          <p className="text-xl font-semibold text-gray-900">
            {headline.hasData ? headline.fuelGallons.toLocaleString() : '—'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500">In-store sales</p>
          <p className="text-xl font-semibold text-gray-900">
            {headline.hasData ? formatUsd(headline.inStoreSales) : '—'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500">Labor cost</p>
          <p className="text-xl font-semibold text-gray-900">
            {headline.hasData ? formatUsd(headline.laborCost) : '—'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-500">Waste + shrink</p>
          <p className="text-xl font-semibold text-red-600">
            {headline.hasData ? formatUsd(headline.wasteCost) : '—'}
          </p>
        </div>
      </div>

      {/* Morning action list */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Morning action list</h2>
          <span className="text-sm text-gray-500">
            {chainRecs.length + stationGroups.reduce((acc, [, list]) => acc + list.length, 0)} items
          </span>
        </div>

        {stations.length === 0 && (
          <p className="text-sm text-gray-600">
            No stations registered yet. Add your first store under <strong>Stations</strong>.
          </p>
        )}

        {stations.length > 0 &&
          chainRecs.length === 0 &&
          stationGroups.length === 0 && (
            <p className="text-sm text-gray-600">
              No recommendations for this date. The AI engine writes the morning brief overnight —
              or seed rows via the API to preview the dashboard.
            </p>
          )}

        {chainRecs.length > 0 && (
          <div className="space-y-3">
            {stationFilter === 'all' && stations.length > 1 && (
              <h3 className="text-sm font-semibold text-violet-700 uppercase tracking-wide">
                Across your stores
              </h3>
            )}
            {chainRecs.map(renderRecCard)}
          </div>
        )}

        {stationGroups.map(([stationId, recs]) => {
          const station = stationById.get(stationId);
          return (
            <div key={stationId} className="space-y-3">
              {(stationFilter === 'all' || stations.length > 1) && (
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  {station ? `${station.stationCode} — ${station.stationName}` : `Station #${stationId}`}
                </h3>
              )}
              {recs.map(renderRecCard)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
