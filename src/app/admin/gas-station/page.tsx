import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { getTenantId } from '@/lib/env';
import { fetchTenantSettingsByTenantId } from '@/app/admin/tenant-management/settings/ApiServerActions';
import {
  fetchGasStationLocationsServer,
  fetchGasStationDailyMetricsServer,
  fetchGasStationRecommendationsServer,
} from './ApiServerActions';
import GasStationDashboardClient from './GasStationDashboardClient';

export const dynamic = 'force-dynamic';

export default async function GasStationDashboardPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [settings, stations, metrics, recommendations] = await Promise.all([
    fetchTenantSettingsByTenantId(getTenantId()),
    fetchGasStationLocationsServer(),
    fetchGasStationDailyMetricsServer(today),
    fetchGasStationRecommendationsServer(today),
  ]);

  const moduleEnabled = settings?.enableGasStationModule ?? false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '160px' }}>
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <Link
          href="/admin"
          className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
        >
          <FaArrowLeft className="w-4 h-4 mr-2" />
          Admin Dashboard
        </Link>
      </nav>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gas Station COO</h1>
          <p className="mt-2 text-sm text-gray-600">
            Daily morning brief — prescriptive actions with dollar impact per station
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/gas-station/stations"
            className="px-4 py-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold transition-colors"
          >
            Stations
          </Link>
          <Link
            href="/admin/gas-station/integrations"
            className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold transition-colors"
          >
            Integrations
          </Link>
          <Link
            href="/admin/gas-station/compare"
            className="px-4 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold transition-colors"
          >
            Compare
          </Link>
          <Link
            href="/admin/gas-station/billing"
            className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-700 font-semibold transition-colors"
          >
            Billing
          </Link>
        </div>
      </div>

      {!moduleEnabled && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          The gas station module is not enabled for this tenant. Enable it under{' '}
          <Link href="/admin/tenant-management/settings" className="underline font-medium">
            Tenant Settings → Integrations
          </Link>{' '}
          and set the organization&apos;s Site Type to <strong>Gas Station (AI COO)</strong>.
        </div>
      )}

      <GasStationDashboardClient
        initialDate={today}
        stations={stations}
        initialMetrics={metrics}
        initialRecommendations={recommendations}
      />
    </div>
  );
}
