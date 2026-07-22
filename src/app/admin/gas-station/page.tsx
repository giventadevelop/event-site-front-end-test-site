import Link from 'next/link';
import { getTenantId } from '@/lib/env';
import { fetchTenantSettingsByTenantId } from '@/app/admin/tenant-management/settings/ApiServerActions';
import {
  fetchGasStationLocationsServer,
  fetchGasStationDailyMetricsServer,
  fetchGasStationRecommendationsServer,
} from './ApiServerActions';
import { resolveGasStationAccessForCurrentUser } from './gasStationAccessServer';
import GasStationDashboardClient from './GasStationDashboardClient';

export const dynamic = 'force-dynamic';

export default async function GasStationDashboardPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [settings, stations, metrics, recommendations, access] = await Promise.all([
    fetchTenantSettingsByTenantId(getTenantId()),
    fetchGasStationLocationsServer(),
    fetchGasStationDailyMetricsServer(today),
    fetchGasStationRecommendationsServer(today),
    resolveGasStationAccessForCurrentUser(),
  ]);

  const moduleEnabled = settings?.enableGasStationModule ?? false;
  const isTenantGasAdmin = access.scope === 'ALL';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '160px' }}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <Link
            href="/admin"
            className="flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Back to Admin"
            aria-label="Back to Admin"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="font-semibold text-indigo-700">Back to Admin</span>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900">Gas Station COO</h1>
            <p className="mt-2 text-sm text-gray-600">
              Daily morning brief — prescriptive actions with dollar impact per station
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          {isTenantGasAdmin && (
            <>
              <Link
                href="/admin/gas-station/stations"
                className="px-4 py-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold transition-colors"
              >
                Stations
              </Link>
              <Link
                href="/admin/gas-station/access"
                className="px-4 py-2 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold transition-colors"
              >
                Location access
              </Link>
            </>
          )}
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
          {isTenantGasAdmin && (
            <Link
              href="/admin/gas-station/billing"
              className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-700 font-semibold transition-colors"
            >
              Billing
            </Link>
          )}
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

      {access.scope === 'ASSIGNED' && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
          You are signed in as a <strong>location manager</strong> with access to{' '}
          <strong>{access.allowedStationIds?.length ?? 0}</strong> station(s). Chain-level items appear
          when you have at least one assigned location.
        </div>
      )}

      {!access.canAccessModule && moduleEnabled && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          Your account does not have a gas station admin role. Ask a tenant admin to assign{' '}
          <code>GAS_STATION_MANAGER</code> (with locations) or <code>GAS_STATION_ADMIN</code>.
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
