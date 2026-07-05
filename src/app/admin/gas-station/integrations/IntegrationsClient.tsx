'use client';

import { useMemo, useState, useTransition } from 'react';
import type {
  GasStationLocationDTO,
  GasStationIntegrationDTO,
  GasStationSystemType,
  GasStationConnectionMode,
} from '@/types/gasStation';
import {
  createGasStationIntegrationServer,
  updateGasStationIntegrationServer,
  deleteGasStationIntegrationServer,
  fetchGasStationIntegrationsServer,
} from '../ApiServerActions';

interface Props {
  stations: GasStationLocationDTO[];
  initialIntegrations: GasStationIntegrationDTO[];
}

const SYSTEM_TYPES: { value: GasStationSystemType; label: string }[] = [
  { value: 'POS', label: 'Point of Sale (POS)' },
  { value: 'FUEL_CONTROLLER', label: 'Fuel Controller' },
  { value: 'INVENTORY', label: 'Inventory' },
  { value: 'PAYROLL_SCHEDULING', label: 'Payroll / Scheduling' },
  { value: 'ACCOUNTING', label: 'Accounting' },
  { value: 'LOTTERY', label: 'Lottery' },
  { value: 'CAR_WASH', label: 'Car Wash' },
  { value: 'FOODSERVICE', label: 'Foodservice' },
  { value: 'OTHER', label: 'Other' },
];

const CONNECTION_MODES: { value: GasStationConnectionMode; label: string }[] = [
  { value: 'API', label: 'Direct API' },
  { value: 'FILE_UPLOAD', label: 'File upload' },
  { value: 'SFTP', label: 'SFTP drop' },
  { value: 'MANUAL', label: 'Manual entry' },
];

type IntegrationForm = Omit<GasStationIntegrationDTO, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>;

export default function IntegrationsClient({ stations, initialIntegrations }: Props) {
  const emptyForm: IntegrationForm = {
    stationId: stations[0]?.id ?? 0,
    systemType: 'POS',
    providerName: '',
    connectionMode: 'MANUAL',
    configJson: '',
    credentialsRef: '',
    syncFrequency: '',
    isEnabled: true,
  };

  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [form, setForm] = useState<IntegrationForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [stationFilter, setStationFilter] = useState<'all' | number>('all');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const stationById = useMemo(() => {
    const map = new Map<number, GasStationLocationDTO>();
    for (const s of stations) if (s.id != null) map.set(s.id, s);
    return map;
  }, [stations]);

  const visible = useMemo(
    () =>
      stationFilter === 'all'
        ? integrations
        : integrations.filter((i) => i.stationId === stationFilter),
    [integrations, stationFilter]
  );

  const set = <K extends keyof IntegrationForm>(key: K, value: IntegrationForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const reload = async () => setIntegrations(await fetchGasStationIntegrationsServer());

  const startCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError('');
  };

  const startEdit = (integration: GasStationIntegrationDTO) => {
    const { id, tenantId, createdAt, updatedAt, lastSyncAt, lastSyncStatus, ...rest } = integration;
    setForm({ ...emptyForm, ...rest });
    setEditingId(id ?? null);
    setShowForm(true);
    setError('');
  };

  const submit = () => {
    if (!form.stationId) {
      setError('Station is required — register a station first');
      return;
    }
    if (form.configJson?.trim()) {
      try {
        JSON.parse(form.configJson);
      } catch {
        setError('Config must be valid JSON');
        return;
      }
    }
    setError('');
    startTransition(async () => {
      const result = editingId
        ? await updateGasStationIntegrationServer(editingId, form)
        : await createGasStationIntegrationServer(form);
      if (!result) {
        setError('Save failed');
        return;
      }
      await reload();
      setShowForm(false);
    });
  };

  const remove = (integration: GasStationIntegrationDTO) => {
    if (integration.id == null) return;
    if (!window.confirm('Delete this integration registration?')) return;
    const id = integration.id;
    startTransition(async () => {
      const ok = await deleteGasStationIntegrationServer(id);
      if (ok) await reload();
    });
  };

  const inputClass =
    'mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-base';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        {stations.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by station</label>
            <select
              value={stationFilter === 'all' ? 'all' : String(stationFilter)}
              onChange={(e) =>
                setStationFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="border border-gray-400 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All stations</option>
              {stations.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.stationCode} — {s.stationName}
                </option>
              ))}
            </select>
          </div>
        )}
        <button
          type="button"
          onClick={startCreate}
          disabled={stations.length === 0}
          className="ml-auto px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold transition-colors disabled:opacity-50"
        >
          + Add Integration
        </button>
      </div>

      {stations.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          Register a station first — integrations attach to a specific store.
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            {editingId ? 'Edit Integration' : 'New Integration'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Station *</label>
              <select
                value={String(form.stationId)}
                onChange={(e) => set('stationId', Number(e.target.value))}
                className={inputClass}
              >
                {stations.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.stationCode} — {s.stationName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">System Type *</label>
              <select
                value={form.systemType}
                onChange={(e) => set('systemType', e.target.value as GasStationSystemType)}
                className={inputClass}
              >
                {SYSTEM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Provider</label>
              <input
                type="text"
                value={form.providerName ?? ''}
                onChange={(e) => set('providerName', e.target.value)}
                className={inputClass}
                placeholder="Verifone, Gilbarco, ADP…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Connection Mode</label>
              <select
                value={form.connectionMode ?? 'MANUAL'}
                onChange={(e) => set('connectionMode', e.target.value as GasStationConnectionMode)}
                className={inputClass}
              >
                {CONNECTION_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sync Frequency</label>
              <input
                type="text"
                value={form.syncFrequency ?? ''}
                onChange={(e) => set('syncFrequency', e.target.value)}
                className={inputClass}
                placeholder="NIGHTLY, HOURLY…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Credentials Reference</label>
              <input
                type="text"
                value={form.credentialsRef ?? ''}
                onChange={(e) => set('credentialsRef', e.target.value)}
                className={inputClass}
                placeholder="secrets-manager reference (never the raw secret)"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Config (JSON)</label>
              <textarea
                rows={3}
                value={form.configJson ?? ''}
                onChange={(e) => set('configJson', e.target.value)}
                className={inputClass}
                placeholder='{"storeNumber": "1234", "endpoint": "https://…"}'
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={Boolean(form.isEnabled)}
              onChange={(e) => set('isEnabled', e.target.checked)}
              className="custom-checkbox"
            />
            Enabled (the AI engine ingests from this system)
          </label>

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
              className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold disabled:opacity-50"
            >
              {isPending ? 'Saving…' : editingId ? 'Update Integration' : 'Create Integration'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Station', 'System', 'Provider', 'Mode', 'Sync', 'Last Sync', 'Status', ''].map((h) => (
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
            {visible.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-sm text-gray-500 text-center">
                  No integrations registered.
                </td>
              </tr>
            )}
            {visible.map((i) => {
              const station = stationById.get(i.stationId);
              return (
                <tr key={i.id}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {station ? station.stationCode : `#${i.stationId}`}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {SYSTEM_TYPES.find((t) => t.value === i.systemType)?.label ?? i.systemType}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{i.providerName || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{i.connectionMode ?? 'MANUAL'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{i.syncFrequency || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {i.lastSyncAt ? new Date(i.lastSyncAt).toLocaleString() : 'never'}
                    {i.lastSyncStatus ? ` (${i.lastSyncStatus})` : ''}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        i.isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {i.isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => startEdit(i)}
                      className="text-blue-600 hover:text-blue-800 font-medium mr-4"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
