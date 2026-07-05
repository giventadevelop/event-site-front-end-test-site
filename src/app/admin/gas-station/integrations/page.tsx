import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import {
  fetchGasStationLocationsServer,
  fetchGasStationIntegrationsServer,
} from '../ApiServerActions';
import IntegrationsClient from './IntegrationsClient';

export const dynamic = 'force-dynamic';

export default async function GasStationIntegrationsPage() {
  const [stations, integrations] = await Promise.all([
    fetchGasStationLocationsServer(),
    fetchGasStationIntegrationsServer(),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '160px' }}>
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
        <h1 className="text-3xl font-bold text-gray-900">System Integrations</h1>
        <p className="mt-2 text-sm text-gray-600">
          Registry of each station&apos;s connected systems (POS, fuel controller, payroll…). The
          external AI engine reads this registry to know what to ingest — credentials stay in the
          secrets manager, only references are stored here.
        </p>
      </div>

      <IntegrationsClient stations={stations} initialIntegrations={integrations} />
    </div>
  );
}
