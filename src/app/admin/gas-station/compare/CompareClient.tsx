'use client';

import { useMemo, useState, useTransition } from 'react';
import type { GasStationLocationDTO, GasStationDailyMetricsDTO } from '@/types/gasStation';
import { fetchGasStationMetricsRangeServer } from '../ApiServerActions';

interface Props {
  stations: GasStationLocationDTO[];
  initialFromDate: string;
  initialToDate: string;
  initialMetrics: GasStationDailyMetricsDTO[];
}

interface StationAggregate {
  stationId: number;
  stationLabel: string;
  region: string;
  days: number;
  expectedProfit: number;
  actualProfit: number;
  fuelGallons: number;
  fuelMarginAvg: number | null;
  inStoreSales: number;
  laborCost: number;
  wasteCost: number;
}

type SortKey = keyof Pick<
  StationAggregate,
  'expectedProfit' | 'actualProfit' | 'fuelGallons' | 'fuelMarginAvg' | 'inStoreSales' | 'laborCost' | 'wasteCost'
>;

function formatUsd(value: number | null): string {
  if (value == null) return '—';
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function CompareClient({
  stations,
  initialFromDate,
  initialToDate,
  initialMetrics,
}: Props) {
  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [sortKey, setSortKey] = useState<SortKey>('actualProfit');
  const [sortDesc, setSortDesc] = useState(true);
  const [isPending, startTransition] = useTransition();

  const reload = (from: string, to: string) => {
    startTransition(async () => {
      setMetrics(await fetchGasStationMetricsRangeServer(from, to));
    });
  };

  const aggregates = useMemo<StationAggregate[]>(() => {
    const byStation = new Map<number, GasStationDailyMetricsDTO[]>();
    for (const m of metrics) {
      const list = byStation.get(m.stationId) ?? [];
      list.push(m);
      byStation.set(m.stationId, list);
    }
    const rows: StationAggregate[] = [];
    for (const station of stations) {
      if (station.id == null) continue;
      const list = byStation.get(station.id) ?? [];
      const sum = (pick: (m: GasStationDailyMetricsDTO) => number | undefined) =>
        list.reduce((acc, m) => acc + (pick(m) ?? 0), 0);
      const margins = list
        .map((m) => m.fuelMarginCentsPerGallon)
        .filter((v): v is number => v != null);
      rows.push({
        stationId: station.id,
        stationLabel: `${station.stationCode} — ${station.stationName}`,
        region: station.region ?? '—',
        days: list.length,
        expectedProfit: sum((m) => m.expectedProfitUsd),
        actualProfit: sum((m) => m.actualProfitUsd),
        fuelGallons: sum((m) => m.fuelGallonsSold),
        fuelMarginAvg: margins.length
          ? margins.reduce((a, b) => a + b, 0) / margins.length
          : null,
        inStoreSales: sum((m) => m.inStoreSalesUsd),
        laborCost: sum((m) => m.laborCostUsd),
        wasteCost: sum((m) => (m.wasteCostUsd ?? 0) + (m.shrinkCostUsd ?? 0)),
      });
    }
    rows.sort((a, b) => {
      const av = a[sortKey] ?? -Infinity;
      const bv = b[sortKey] ?? -Infinity;
      return sortDesc ? Number(bv) - Number(av) : Number(av) - Number(bv);
    });
    return rows;
  }, [metrics, stations, sortKey, sortDesc]);

  const headerButton = (key: SortKey, label: string) => (
    <button
      type="button"
      onClick={() => {
        if (sortKey === key) setSortDesc((d) => !d);
        else {
          setSortKey(key);
          setSortDesc(true);
        }
      }}
      className={`text-xs font-medium uppercase tracking-wider ${
        sortKey === key ? 'text-blue-700' : 'text-gray-500'
      } hover:text-blue-800`}
    >
      {label}
      {sortKey === key ? (sortDesc ? ' ↓' : ' ↑') : ''}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              reload(e.target.value, toDate);
            }}
            className="border border-gray-400 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              reload(fromDate, e.target.value);
            }}
            className="border border-gray-400 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        {isPending && <span className="text-sm text-gray-500 pb-2">Loading…</span>}
      </div>

      {stations.length < 2 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          The comparison view is most useful with two or more stations. Single-store tenants can use
          the daily dashboard and trends instead.
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Station
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Region
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Days
              </th>
              <th className="px-4 py-3 text-left">{headerButton('actualProfit', 'Actual Profit')}</th>
              <th className="px-4 py-3 text-left">{headerButton('expectedProfit', 'Expected Profit')}</th>
              <th className="px-4 py-3 text-left">{headerButton('fuelGallons', 'Gallons')}</th>
              <th className="px-4 py-3 text-left">{headerButton('fuelMarginAvg', 'Margin ¢/gal')}</th>
              <th className="px-4 py-3 text-left">{headerButton('inStoreSales', 'In-store Sales')}</th>
              <th className="px-4 py-3 text-left">{headerButton('laborCost', 'Labor')}</th>
              <th className="px-4 py-3 text-left">{headerButton('wasteCost', 'Waste + Shrink')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {aggregates.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-sm text-gray-500 text-center">
                  No stations registered.
                </td>
              </tr>
            )}
            {aggregates.map((row, index) => (
              <tr key={row.stationId} className={index === 0 && row.days > 0 ? 'bg-emerald-50/50' : ''}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.stationLabel}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{row.region}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{row.days}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  {row.days ? formatUsd(row.actualProfit) : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {row.days ? formatUsd(row.expectedProfit) : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {row.days ? row.fuelGallons.toLocaleString() : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {row.fuelMarginAvg != null ? row.fuelMarginAvg.toFixed(1) : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {row.days ? formatUsd(row.inStoreSales) : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {row.days ? formatUsd(row.laborCost) : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-red-600">
                  {row.days ? formatUsd(row.wasteCost) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
