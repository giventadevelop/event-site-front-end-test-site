import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import {
  fetchGasStationLocationsServer,
  fetchTenantOrganizationForBillingServer,
} from '../ApiServerActions';
import BillingClient from './BillingClient';

export const dynamic = 'force-dynamic';

export default async function GasStationBillingPage() {
  const [organization, stations] = await Promise.all([
    fetchTenantOrganizationForBillingServer(),
    fetchGasStationLocationsServer(),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '160px' }}>
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
        <h1 className="text-3xl font-bold text-gray-900">Subscription &amp; Billing</h1>
        <p className="mt-2 text-sm text-gray-600">
          Per-location subscription with volume discounts — choose which locations are on the plan,
          pay by card, Apple&nbsp;Pay / Google&nbsp;Pay, or US bank account
        </p>
      </div>

      <BillingClient organization={organization} initialStations={stations} />
    </div>
  );
}
