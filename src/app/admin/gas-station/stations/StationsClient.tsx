'use client';

import { useState, useTransition } from 'react';
import type { GasStationLocationDTO } from '@/types/gasStation';
import {
  createGasStationLocationServer,
  updateGasStationLocationServer,
  deleteGasStationLocationServer,
  fetchGasStationLocationsServer,
} from '../ApiServerActions';

interface Props {
  initialStations: GasStationLocationDTO[];
}

type StationForm = Omit<GasStationLocationDTO, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>;

const EMPTY_FORM: StationForm = {
  stationName: '',
  stationCode: '',
  brand: '',
  region: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  stateProvince: '',
  zipCode: '',
  country: 'United States',
  latitude: undefined,
  longitude: undefined,
  timezone: 'America/New_York',
  sellsFuel: true,
  fuelDispenserCount: undefined,
  hasCarWash: false,
  hasFoodservice: false,
  hasLottery: false,
  is24Hours: false,
  isActive: true,
};

export default function StationsClient({ initialStations }: Props) {
  const [stations, setStations] = useState(initialStations);
  const [form, setForm] = useState<StationForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const set = <K extends keyof StationForm>(key: K, value: StationForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const reload = async () => setStations(await fetchGasStationLocationsServer());

  const startCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setError('');
  };

  const startEdit = (station: GasStationLocationDTO) => {
    const { id, tenantId, createdAt, updatedAt, ...rest } = station;
    setForm({ ...EMPTY_FORM, ...rest });
    setEditingId(id ?? null);
    setShowForm(true);
    setError('');
  };

  const submit = () => {
    if (!form.stationName.trim() || !form.stationCode.trim()) {
      setError('Station name and station code are required');
      return;
    }
    setError('');
    startTransition(async () => {
      const result = editingId
        ? await updateGasStationLocationServer(editingId, form)
        : await createGasStationLocationServer(form);
      if (!result) {
        setError('Save failed — check that the station code is unique for this tenant');
        return;
      }
      await reload();
      setShowForm(false);
    });
  };

  const remove = (station: GasStationLocationDTO) => {
    if (station.id == null) return;
    if (!window.confirm(`Delete station ${station.stationCode} — ${station.stationName}? Its integrations, metrics and recommendations will be removed.`)) {
      return;
    }
    const id = station.id;
    startTransition(async () => {
      const ok = await deleteGasStationLocationServer(id);
      if (ok) await reload();
    });
  };

  const inputClass =
    'mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-base';

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={startCreate}
          className="px-4 py-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold transition-colors"
        >
          + Add Station
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            {editingId ? 'Edit Station' : 'New Station'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Station Name *</label>
              <input
                type="text"
                value={form.stationName}
                onChange={(e) => set('stationName', e.target.value)}
                className={inputClass}
                placeholder="Nisha's Gas Station"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Station Code *</label>
              <input
                type="text"
                value={form.stationCode}
                onChange={(e) => set('stationCode', e.target.value)}
                className={inputClass}
                placeholder="ST-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Brand</label>
              <input
                type="text"
                value={form.brand ?? ''}
                onChange={(e) => set('brand', e.target.value)}
                className={inputClass}
                placeholder="Shell, Chevron, unbranded…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Region / District</label>
              <input
                type="text"
                value={form.region ?? ''}
                onChange={(e) => set('region', e.target.value)}
                className={inputClass}
                placeholder="North Bay"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Timezone</label>
              <input
                type="text"
                value={form.timezone ?? ''}
                onChange={(e) => set('timezone', e.target.value)}
                className={inputClass}
                placeholder="America/New_York"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fuel Dispensers</label>
              <input
                type="number"
                min="0"
                value={form.fuelDispenserCount ?? ''}
                onChange={(e) =>
                  set('fuelDispenserCount', e.target.value === '' ? undefined : Number(e.target.value))
                }
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
              <input
                type="text"
                value={form.addressLine1 ?? ''}
                onChange={(e) => set('addressLine1', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
              <input
                type="text"
                value={form.addressLine2 ?? ''}
                onChange={(e) => set('addressLine2', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                value={form.city ?? ''}
                onChange={(e) => set('city', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State / Province</label>
              <input
                type="text"
                value={form.stateProvince ?? ''}
                onChange={(e) => set('stateProvince', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ZIP</label>
              <input
                type="text"
                value={form.zipCode ?? ''}
                onChange={(e) => set('zipCode', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input
                type="text"
                value={form.country ?? ''}
                onChange={(e) => set('country', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Latitude</label>
              <input
                type="number"
                step="0.0000001"
                value={form.latitude ?? ''}
                onChange={(e) => set('latitude', e.target.value === '' ? undefined : Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Longitude</label>
              <input
                type="number"
                step="0.0000001"
                value={form.longitude ?? ''}
                onChange={(e) => set('longitude', e.target.value === '' ? undefined : Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            {(
              [
                ['sellsFuel', 'Sells fuel'],
                ['hasCarWash', 'Car wash'],
                ['hasFoodservice', 'Foodservice'],
                ['hasLottery', 'Lottery'],
                ['is24Hours', 'Open 24 hours'],
                ['isActive', 'Active'],
              ] as [keyof StationForm, string][]
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={Boolean(form[key])}
                  onChange={(e) => set(key, e.target.checked as StationForm[typeof key])}
                  className="custom-checkbox"
                />
                {label}
              </label>
            ))}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={submit}
              className="px-4 py-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold disabled:opacity-50"
            >
              {isPending ? 'Saving…' : editingId ? 'Update Station' : 'Create Station'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Code', 'Name', 'Brand', 'Region', 'City', 'Capabilities', 'Status', ''].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stations.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-sm text-gray-500 text-center">
                  No stations yet — add the first store for this tenant.
                </td>
              </tr>
            )}
            {stations.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.stationCode}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{s.stationName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{s.brand || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{s.region || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{s.city || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {[
                    s.sellsFuel ? 'Fuel' : null,
                    s.hasCarWash ? 'Car wash' : null,
                    s.hasFoodservice ? 'Food' : null,
                    s.hasLottery ? 'Lottery' : null,
                    s.is24Hours ? '24h' : null,
                  ]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      s.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => startEdit(s)}
                    className="text-blue-600 hover:text-blue-800 font-medium mr-4"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(s)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
