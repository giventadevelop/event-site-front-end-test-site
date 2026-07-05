'use client';

import { useMemo, useState, useTransition } from 'react';
import type { TenantOrganizationDTO } from '@/types';
import type { GasStationLocationDTO } from '@/types/gasStation';
import {
  GAS_STATION_PRICING_TIERS,
  computeGasMonthlyTotalUsd,
} from '@/lib/gasStationPricing';
import { updateStationSubscriptionFlagServer } from '../ApiServerActions';

interface Props {
  organization: TenantOrganizationDTO | null;
  initialStations: GasStationLocationDTO[];
}

function formatUsd(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function BillingClient({ organization, initialStations }: Props) {
  const [stations, setStations] = useState(initialStations);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [redirecting, setRedirecting] = useState(false);

  const hasSubscription = Boolean(organization?.stripeSubscriptionId);

  const billableCount = useMemo(
    () => stations.filter((s) => s.isActive && (s.includedInSubscription ?? true)).length,
    [stations]
  );
  const monthlyTotal = computeGasMonthlyTotalUsd(billableCount);

  const toggleStation = (station: GasStationLocationDTO) => {
    if (station.id == null) return;
    const id = station.id;
    const next = !(station.includedInSubscription ?? true);
    // Optimistic update
    setStations((prev) =>
      prev.map((s) => (s.id === id ? { ...s, includedInSubscription: next } : s))
    );
    startTransition(async () => {
      const updated = await updateStationSubscriptionFlagServer(id, next);
      if (!updated) {
        // Revert on failure
        setStations((prev) =>
          prev.map((s) => (s.id === id ? { ...s, includedInSubscription: !next } : s))
        );
        setError('Failed to update location — try again');
      } else {
        setError('');
      }
    });
  };

  const callBilling = async (payload: Record<string, unknown>, expectRedirect: boolean) => {
    setError('');
    setRedirecting(expectRedirect);
    try {
      const res = await fetch('/api/stripe/gas-station-billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Request failed');
        setRedirecting(false);
        return;
      }
      if (expectRedirect && data.url) {
        window.location.href = data.url;
        return;
      }
      setRedirecting(false);
    } catch (err) {
      console.error(err);
      setError('Request failed — is Stripe configured?');
      setRedirecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current plan */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current subscription</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Plan</p>
            <p className="font-semibold text-gray-900">{organization?.subscriptionPlan || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <p className="font-semibold text-gray-900">{organization?.subscriptionStatus || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Stripe subscription</p>
            <p className="font-semibold text-gray-900">
              {hasSubscription ? 'Linked' : 'Not subscribed'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Payment methods</p>
            <p className="font-semibold text-gray-900">Card · Wallets · Bank (ACH)</p>
          </div>
        </div>
      </div>

      {/* Pricing tiers */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Per-location pricing</h2>
        <p className="text-sm text-gray-600 mb-4">
          Graduated volume discount — each location is priced at the tier it falls into
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {GAS_STATION_PRICING_TIERS.map((tier, index) => {
            const from = index === 0 ? 1 : GAS_STATION_PRICING_TIERS[index - 1].upTo + 1;
            const label =
              tier.upTo === Infinity ? `${from}+ locations` : `${from}–${tier.upTo} locations`;
            return (
              <div key={label} className="border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{formatUsd(tier.perLocationUsd)}</p>
                <p className="text-xs text-gray-500">per location / month</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Location selection */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Locations on the subscription</h2>
            <p className="text-sm text-gray-600">
              Toggle which stores are billed — quantity changes are prorated by Stripe
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-600">{formatUsd(monthlyTotal)}/mo</p>
            <p className="text-xs text-gray-500">
              {billableCount} billable location{billableCount === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {stations.length === 0 && (
          <p className="text-sm text-gray-600">
            No stations registered — add stores under Stations first.
          </p>
        )}

        <ul className="divide-y divide-gray-200">
          {stations.map((s) => {
            const included = s.includedInSubscription ?? true;
            return (
              <li key={s.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">
                    {s.stationCode} — {s.stationName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {[s.city, s.region].filter(Boolean).join(' · ') || '—'}
                    {!s.isActive && ' · INACTIVE (never billed)'}
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={included}
                    disabled={isPending || !s.isActive}
                    onChange={() => toggleStation(s)}
                    className="w-5 h-5"
                  />
                  {included && s.isActive ? 'Included' : 'Excluded'}
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 flex flex-wrap gap-3">
        {!hasSubscription && (
          <button
            type="button"
            disabled={redirecting || billableCount === 0}
            onClick={() => callBilling({ action: 'checkout', quantity: billableCount }, true)}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
          >
            {redirecting ? 'Opening Stripe…' : `Subscribe — ${formatUsd(monthlyTotal)}/mo`}
          </button>
        )}
        {hasSubscription && (
          <button
            type="button"
            disabled={redirecting || billableCount === 0}
            onClick={() => callBilling({ action: 'sync-quantity', quantity: billableCount }, false)}
            className="px-6 py-3 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold disabled:opacity-50"
          >
            Update quantity to {billableCount}
          </button>
        )}
        <button
          type="button"
          disabled={redirecting}
          onClick={() => callBilling({ action: 'portal' }, true)}
          className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold disabled:opacity-50"
        >
          Manage billing (invoices, payment methods, cancel)
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Checkout and billing management open Stripe-hosted, mobile-optimized pages. Bank account
        (ACH) payment appears at checkout when enabled for the platform. Card details are never
        touched by this application.
      </p>
    </div>
  );
}
