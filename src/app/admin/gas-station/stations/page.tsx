import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { fetchGasStationLocationsServer } from '../ApiServerActions';
import StationsClient from './StationsClient';

export const dynamic = 'force-dynamic';

export default async function GasStationStationsPage() {
  const stations = await fetchGasStationLocationsServer();

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
        <h1 className="text-3xl font-bold text-gray-900">Stations</h1>
        <p className="mt-2 text-sm text-gray-600">
          Store locations for this tenant — a single owner or a chain (each station has its own
          code, address, and capabilities)
        </p>
      </div>

      <StationsClient initialStations={stations} />
    </div>
  );
}
