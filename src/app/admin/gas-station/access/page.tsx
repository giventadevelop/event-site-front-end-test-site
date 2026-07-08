import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import type { UserProfileDTO } from '@/types';
import { fetchUsersServer } from '@/app/admin/manage-usage/ApiServerActions';
import { fetchGasStationLocationsServer } from '../ApiServerActions';
import {
  assertGasStationTenantAdminAccess,
  fetchAllGasStationAssignmentsServer,
} from '../gasStationAccessServer';
import GasStationAccessClient from './GasStationAccessClient';

export const dynamic = 'force-dynamic';

export default async function GasStationAccessPage() {
  let access;
  try {
    access = await assertGasStationTenantAdminAccess();
  } catch {
    redirect('/admin/gas-station');
  }

  const [{ data: managersRaw }, stations, assignments] = await Promise.all([
    fetchUsersServer({
      search: '',
      searchField: 'email',
      status: '',
      role: 'GAS_STATION_MANAGER',
      page: 1,
      pageSize: 200,
    }),
    fetchGasStationLocationsServer(),
    fetchAllGasStationAssignmentsServer(),
  ]);

  const managers = Array.isArray(managersRaw)
    ? managersRaw
    : (managersRaw as { content?: UserProfileDTO[] })?.content ?? [];

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
        <h1 className="text-3xl font-bold text-gray-900">Location access</h1>
        <p className="mt-2 text-sm text-gray-600">
          Map <strong>GAS_STATION_MANAGER</strong> users to one or more stations. Super admins and gas
          station admins always have access to every location in the tenant.
        </p>
      </div>

      <GasStationAccessClient
        managers={managers}
        stations={stations}
        initialAssignments={assignments}
        adminProfileId={access.userProfileId}
      />
    </div>
  );
}
