import Stripe from "stripe";
import { initStripeConfig } from './init';

// For cases where we need a singleton instance
let stripeInstance: Stripe | null = null;

export const stripe = () => {
  if (!stripeInstance) {
    // Use the robust initialization from init.ts
    stripeInstance = initStripeConfig();
  }
  if (!stripeInstance) {
    // This will only happen if the config fails to initialize
    throw new Error('Stripe failed to initialize. Check server logs for details.');
  }
  return stripeInstance;
};

export type StripeSubscriptionStatus =
  | "trialing"
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "paused"
  | "unpaid";

export type StripePriceType = "one_time" | "recurring";

export type StripeSubscriptionPriceInterval = "day" | "week" | "month" | "year";

export interface StripeSubscription {
  id: string;
  status: StripeSubscriptionStatus;
  current_period_end: number;
  cancel_at_period_end: boolean;
}

export interface StripePrice {
  id: string;
  type: StripePriceType;
  interval?: StripeSubscriptionPriceInterval;
  interval_count?: number;
  unit_amount: number;
  currency: string;
  product: {
    name: string;
    description?: string;
  };
}
