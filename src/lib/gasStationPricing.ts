/**
 * Graduated per-location pricing for the gas station COO subscription.
 * Mirrors the graduated-tier Price configured in Stripe (STRIPE_GAS_STATION_PRICE_ID)
 * so the dashboard can preview the monthly total before checkout.
 * Placeholder amounts — adjust together with the Stripe Price.
 */

export interface GasPricingTier {
  /** Highest location count this tier applies to (Infinity for the last tier) */
  upTo: number;
  /** Monthly price per location within this tier, USD */
  perLocationUsd: number;
}

export const GAS_STATION_PRICING_TIERS: GasPricingTier[] = [
  { upTo: 3, perLocationUsd: 199 },
  { upTo: 10, perLocationUsd: 149 },
  { upTo: Infinity, perLocationUsd: 99 },
];

/** Graduated total: each location is priced at the tier it falls into. */
export function computeGasMonthlyTotalUsd(locationCount: number): number {
  let remaining = Math.max(0, locationCount);
  let total = 0;
  let previousUpTo = 0;
  for (const tier of GAS_STATION_PRICING_TIERS) {
    if (remaining <= 0) break;
    const tierCapacity = tier.upTo - previousUpTo;
    const inTier = Math.min(remaining, tierCapacity);
    total += inTier * tier.perLocationUsd;
    remaining -= inTier;
    previousUpTo = tier.upTo;
  }
  return total;
}

/** Marginal rate for the Nth location (1-based). */
export function perLocationRateUsd(locationIndex: number): number {
  let previousUpTo = 0;
  for (const tier of GAS_STATION_PRICING_TIERS) {
    if (locationIndex <= tier.upTo) return tier.perLocationUsd;
    previousUpTo = tier.upTo;
  }
  return GAS_STATION_PRICING_TIERS[GAS_STATION_PRICING_TIERS.length - 1].perLocationUsd;
}
