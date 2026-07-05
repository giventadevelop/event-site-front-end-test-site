import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import {
  fetchGasStationLocationsServer,
  fetchGasStationMetricsRangeServer,
} from '../ApiServerActions';
import CompareClient from './CompareClient';

export const dynamic = 'force-dynamic';

export default async function GasStationComparePage() {
  const today = new Date();
  const toDate = today.toISOString().slice(0, 10);
  const fromDate = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [stations, metrics] = await Promise.all([
    fetchGasStationLocationsServer(),
    fetchGasStationMetricsRangeServer(fromDate, toDate),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '160px' }}>
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <Link
          href="/admin/gas-station"
          className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
        >
          <FaArrowLeft className="w-4 h-4 mr-2" />
          Gas Station COO
        </Link>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Station Comparison</h1>
        <p className="mt-2 text-sm text-gray-600">
          Rank stores over a date range to surface the best and worst performers across profit,
          fuel, labor, and waste
        </p>
      </div>

      <CompareClient
        stations={stations}
        initialFromDate={fromDate}
        initialToDate={toDate}
        initialMetrics={metrics}
      />
    </div>
  );
}
