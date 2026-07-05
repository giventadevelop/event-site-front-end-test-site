# Gas Station Subscription & Billing — Requirements, Provider Analysis, Design

**Status of the requirement before this doc:** NOT captured. The feasibility doc assumed one tenant-level
plan (`tenant_organization.subscription_plan` + `monthly_fee_usd`) and explicitly relied on the existing
Stripe fields — but said nothing about **per-location pricing**, **volume discounts**, or **which locations
are billable**. This doc captures those requirements and the implementation decision.

---

## 1. Requirement (captured)

A gas-station tenant (owner or chain) owns 1..N `gas_station_location` rows. Billing must support:

1. **Per-location subscription** — the price scales with the number of subscribed locations, not a flat
   tenant fee.
2. **Volume discounting** — a chain adding locations pays a *discounted per-location rate* as the count
   grows (one compounded monthly price, not N separate subscriptions).
3. **Location selection** — the owner chooses **which** of their locations are on the subscription
   (e.g. 5 of 7 stores); adding/removing a location adjusts the next invoice with proration.
4. **One subscription per tenant** — a single Stripe subscription whose **quantity = number of billable
   locations**; never one subscription per store (avoids N invoices, N payment methods, N failure points).
5. **Payment methods** — credit/debit cards, Apple Pay / Google Pay, **and US bank account (ACH debit)**
   for owners who prefer bank payment (common in this B2B segment; also cuts card fees ~2.9% → 0.8%).
6. **Mobile-friendly** — the subscribe/manage flows must work on phones (owners live on their phones).
7. **Self-serve management** — update card/bank details, view invoices, cancel — without contacting support.

### Pricing model (graduated tiers — the blueprint's tiers mapped to per-location rates)

| Locations (quantity) | Per-location / month | Example: monthly total |
|---|---|---|
| 1 – 3 | $199 | 2 locations → $398 |
| 4 – 10 | $149 (25% off) | 6 locations → 3×$199 + 3×$149 = $1,044 (graduated) |
| 11+ | $99 (50% off) | negotiated → Enterprise custom contract above ~20 |

*Graduated* (each tier priced on the units inside it) rather than *volume* (whole quantity at the reached
tier) avoids the cliff where adding an 4th location makes the bill go DOWN. Stripe supports both natively;
we choose **graduated**. Exact prices are business decisions — these are placeholders wired into config.

---

## 2. Provider analysis — Stripe vs third-party billing platforms

Evaluated against: what this codebase already has, per-location tiered pricing, ACH, mobile UX, and
operational overhead. (Note: "SOHO" in the request interpreted as **Zoho Billing**.)

| Criterion | **Stripe Billing** (recommended) | Zoho Billing | Chargebee | Paddle / Lemon Squeezy |
|---|---|---|---|---|
| Already integrated here | ✅ Checkout, Elements, PRB (Apple/Google Pay), webhooks, billing portal, `stripe_customer_id` on tenant | ❌ new system | ❌ new system | ❌ new system |
| Quantity-based graduated tiers | ✅ native (`tiers_mode: graduated`) | ✅ | ✅ | ⚠️ limited |
| Proration on quantity change | ✅ automatic | ✅ | ✅ | ⚠️ |
| ACH / US bank debit | ✅ `us_bank_account` (+ instant verification via Financial Connections), 0.8% capped $5 | via Stripe/other gateways anyway | via gateway (often Stripe) | ❌ (merchant of record, cards only) |
| Self-serve portal (mobile-friendly, hosted) | ✅ Customer Portal — zero UI to build | ✅ hosted pages | ✅ | ✅ |
| Extra cost on top of processing | none (0.5–0.8% Billing fee on recurring) | per-org license | 0.75%+ or $599+/mo | higher take rate (MoR) |
| Fit verdict | **Best: builds on what exists** | Only if you adopt Zoho suite org-wide | For complex multi-gateway enterprise billing later | For selling globally without a tax entity — not our case |

**Decision: stay on Stripe, use Stripe Billing.** The codebase already runs Stripe end-to-end (membership
subscriptions, event checkout, webhooks, a `billingPortal` session route). A third-party subscription
manager would add a second system of record, a second webhook surface, and fees — with no capability we
lack. Zoho Billing is only compelling if the business standardizes on Zoho for books/CRM; even then it
typically still uses a gateway like Stripe underneath.

**What Stripe gives us out of the box for this exact requirement:**
- One Product ("Gas Station COO — per location") with a **graduated-tier recurring Price**.
- Subscription with `quantity = billable location count`; changing quantity auto-prorates.
- **Checkout Session (`mode: subscription`)** — hosted, mobile-optimized, supports `card`,
  `us_bank_account`, `link`, wallets. No custom payment UI to build or PCI scope.
- **Customer Portal** — hosted invoices/payment-method/cancel management, mobile-friendly.
- Existing webhook route (`/api/webhooks/stripe`) extends to `customer.subscription.*` events to sync
  status back to `tenant_organization`.

### Relationship to the existing mobile payment rules
`mobile_membership_subscription_payment_flow.mdc` / `mobile_payment_flow.mdc` document the **membership**
(per-user) flows built on PaymentIntents + Payment Request Button. They prove wallet payments work here on
mobile, but for the gas subscription we deliberately use **hosted Stripe Checkout + Customer Portal**
instead of custom PRB flows: subscriptions with tiered quantities and ACH mandates are exactly what the
hosted surfaces handle best, on any device, with none of the custom success/polling machinery those rules
had to build. The membership flows stay untouched.

---

## 3. Data model deltas (migration `migrations/002_gas_station_billing.sql`)

| Table | Change | Purpose |
|---|---|---|
| `tenant_organization` | `stripe_subscription_id varchar(255)` | The single platform subscription for the tenant (customer id already exists) |
| `gas_station_location` | `included_in_subscription boolean DEFAULT true NOT NULL` | Owner's per-location opt-in; billable count = active AND included |

Billable quantity is **computed** (`COUNT(*) WHERE is_active AND included_in_subscription`) — never stored.

---

## 4. Subscription dashboard (implemented at `/admin/gas-station/billing`)

- **Plan summary** — current `subscription_plan`, status, and Stripe linkage from `tenant_organization`.
- **Location selection** — every station listed with an *Included in subscription* toggle; billable count
  and a **live price preview** (graduated tiers) update as toggles change.
- **Subscribe** — creates a Stripe Checkout Session (`mode: subscription`,
  `quantity = billable count`, price from `STRIPE_GAS_STATION_PRICE_ID`); payment methods `card`,
  `link`, and `us_bank_account` (when `STRIPE_GAS_ENABLE_ACH=true`).
- **Manage billing** — opens the Stripe Customer Portal (payment method changes incl. bank details,
  invoices, cancellation).
- **Quantity sync note** — toggling locations after subscribing updates Stripe quantity server-side
  (portal/webhook sync is Phase 2; until then the Update Quantity action re-syncs on demand).
- Responsive layout matching the admin module; Stripe-hosted pages are mobile-optimized by Stripe.

### Environment variables

```env
STRIPE_SECRET_KEY=sk_...                 # already used by membership flows
STRIPE_GAS_STATION_PRICE_ID=price_...    # graduated-tier recurring price (create in Stripe dashboard)
STRIPE_GAS_ENABLE_ACH=true               # adds us_bank_account to Checkout payment methods
```

### Stripe dashboard setup (one-time)
1. Product "Gas Station COO — per location"; recurring monthly Price with **Graduated pricing**:
   tier 1–3 @ $199, 4–10 @ $149, 11+ @ $99 (adjust to final business pricing).
2. Enable **ACH Direct Debit** (US bank accounts) in Settings → Payment methods.
3. Configure the **Customer Portal** (allow payment-method update, invoice history, cancellation).
4. Webhook endpoint already exists; add `customer.subscription.updated|deleted` handling (Phase 2) to
   sync `subscription_status` / `stripe_subscription_id` onto `tenant_organization`.

---

## 5. Phasing

| Phase | Scope |
|---|---|
| 1 (now) | Schema columns; billing dashboard with location toggles + tier preview; Checkout subscribe (card/Link/ACH); Customer Portal manage; on-demand quantity re-sync |
| 2 | Webhook sync of subscription lifecycle onto `tenant_organization`; automatic quantity sync when a location toggle changes; dunning emails |
| 3 | Enterprise: committed-use invoicing (Stripe Invoicing), sales-negotiated custom prices per tenant (per-tenant `stripe_price_id` override column) |
