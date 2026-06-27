"use server";

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import type { EventTicketTransactionDTO, EventDetailsDTO, ManualPaymentRequestDTO, ManualPaymentMethodType, ManualPaymentSummaryReportDTO } from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

if (!getApiBase()) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured');
}

export interface SalesAnalyticsOptions {
  eventId?: string;
  startDate?: string;
  endDate?: string;
  status?: string; // e.g., 'COMPLETED', 'PENDING', 'FAILED', 'REFUNDED', 'CANCELLED' (per database schema)
  page?: number;
  pageSize?: number;
  sort?: string;
}

export interface SalesAnalyticsResponse {
  transactions: EventTicketTransactionDTO[];
  totalCount: number;
}

export interface SalesMetrics {
  eventId?: number;
  totalTransactions: number;
  totalRevenue: number;
  grossRevenue: number;
  netRevenue: number;
  totalDiscounts: number;
  totalRefunds: number;
  platformFees: number;
  taxAmount: number;
  averageTicketPrice: number;
  netRevenueBeforeTax: number; // NEW: Sum of (finalAmount - stripeFeeAmount) per transaction
  salesByTicketType: Array<{ ticketTypeName: string; count: number; revenue: number }>;
  salesByDay: Array<{ date: string; count: number; revenue: number }>;
  salesByHour: Array<{ hour: string; count: number; revenue: number }>;
  salesByWeek: Array<{ week: string; count: number; revenue: number }>;
  salesByMonth: Array<{ month: string; count: number; revenue: number }>;
  revenueByPaymentMethod: Array<{ method: string; count: number; revenue: number }>;
  discountCodeUsage: Array<{ code: string; usageCount: number; totalDiscount: number }>;
  // Manual payment status breakdown (for manual payments only)
  manualPaymentStatusBreakdown: Array<{ status: string; count: number; revenue: number }>;
}

/**
 * Batch Job Request/Response Interfaces for Stripe Fees and Tax Update
 */
export interface StripeFeesTaxUpdateRequest {
  tenantId?: string;
  eventId?: number; // Optional: Filter by specific event ID
  startDate?: string; // ISO 8601 format: "2025-01-01T00:00:00.000Z"
  endDate?: string;   // ISO 8601 format: "2025-01-31T23:59:59.999Z"
  forceUpdate?: boolean; // Default: false
  useDefaultDateRange?: boolean; // Default: false - If true, automatically calculate date range for normal batch runs
}

export interface StripeFeesTaxUpdateResponse {
  jobId: string;
  status: 'STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  tenantId: string | null;
  eventId: number | null; // Optional: Event ID that was processed
  startDate: string | null;
  endDate: string | null;
  forceUpdate: boolean;
  estimatedRecords: number | null;
  estimatedCompletionTime: string | null;
  message: string;
}

/**
 * Fetch sales data with pagination and filtering
 */
export async function fetchSalesDataServer(
  options: SalesAnalyticsOptions = {}
): Promise<SalesAnalyticsResponse> {
  const params = new URLSearchParams();

  if (options.eventId) {
    params.append('eventId.equals', options.eventId);
  }

  if (options.status) {
    params.append('status.equals', options.status);
  }

  // Filter by purchase date range
  if (options.startDate) {
    params.append('purchaseDate.greaterThanOrEqual', options.startDate);
  }

  if (options.endDate) {
    params.append('purchaseDate.lessThanOrEqual', options.endDate);
  }

  const page = options.page ?? 0;
  const pageSize = options.pageSize ?? 20;
  params.append('page', page.toString());
  params.append('size', pageSize.toString());

  if (options.sort) {
    params.append('sort', options.sort);
  } else {
    params.append('sort', 'purchaseDate,desc');
  }

  const url = `${getApiBase()}/api/event-ticket-transactions?${params.toString()}`;
  const response = await fetchWithJwtRetry(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to fetch sales data: ${response.status} ${response.statusText}`);
  }

  const transactions = await response.json();
  const totalCount = parseInt(response.headers.get('x-total-count') || '0', 10);

  return {
    transactions: Array.isArray(transactions) ? transactions : [],
    totalCount,
  };
}

/**
 * Fetch manual payment summary report for analytics
 * Falls back to manual_payment_request table if summary is empty
 */
async function fetchManualPaymentSummaryForAnalytics(
  eventId: string,
  startDate?: string,
  endDate?: string
): Promise<{ summary: ManualPaymentSummaryReportDTO[]; fromFallback: boolean }> {
  const tenantId = getTenantId();
  
  try {
    // Try to fetch from summary table first
    const params = new URLSearchParams({
      'eventId.equals': eventId,
      'tenantId.equals': tenantId,
      'size': '1000',
    });

    if (startDate) {
      params.append('snapshotDate.greaterThanOrEqual', startDate);
    }
    if (endDate) {
      params.append('snapshotDate.lessThanOrEqual', endDate);
    }

    const summaryUrl = `${getApiBase()}/api/manual-payment-summary?${params.toString()}`;
    const summaryResponse = await fetchWithJwtRetry(summaryUrl, { cache: 'no-store' });

    if (summaryResponse.ok) {
      const summaryData: any[] = await summaryResponse.json();
      const summaryArray = Array.isArray(summaryData) ? summaryData : [];
      
      // Map backend field names to frontend DTO field names
      // Database: payment_method_type → Backend: paymentMethodType → Frontend: manualPaymentMethodType
      // Database: transaction_count → Backend: transactionCount → Frontend: requestCount
      const mappedSummary: ManualPaymentSummaryReportDTO[] = summaryArray.map((item: any) => {
        const mapped: any = { ...item };
        // Map paymentMethodType → manualPaymentMethodType
        // Handle both backend DTO field name (paymentMethodType) and potential database field name (payment_method_type)
        if (mapped.paymentMethodType && !mapped.manualPaymentMethodType) {
          mapped.manualPaymentMethodType = mapped.paymentMethodType;
        } else if (mapped.payment_method_type && !mapped.manualPaymentMethodType) {
          mapped.manualPaymentMethodType = mapped.payment_method_type;
        }
        // Map transactionCount → requestCount
        // Handle both backend DTO field name (transactionCount) and potential database field name (transaction_count)
        if (mapped.transactionCount !== undefined && mapped.requestCount === undefined) {
          mapped.requestCount = mapped.transactionCount;
        } else if (mapped.transaction_count !== undefined && mapped.requestCount === undefined) {
          mapped.requestCount = mapped.transaction_count;
        }
        return mapped as ManualPaymentSummaryReportDTO;
      });
      
      // Log sample record for debugging
      if (mappedSummary.length > 0) {
        console.log(`[Sales Analytics] Using manual payment summary table: ${mappedSummary.length} records`);
        console.log(`[Sales Analytics] Sample summary record:`, {
          id: mappedSummary[0].id,
          manualPaymentMethodType: mappedSummary[0].manualPaymentMethodType,
          status: mappedSummary[0].status,
          totalAmount: mappedSummary[0].totalAmount,
          requestCount: mappedSummary[0].requestCount
        });
      }
      
      // If summary has data, return it
      if (mappedSummary.length > 0) {
        return { summary: mappedSummary, fromFallback: false };
      }
    }

    // Fallback: Fetch from manual_payment_request table and aggregate
    console.log(`[Sales Analytics] Summary table empty, falling back to manual_payment_request table`);
    const manualPaymentsUrl = `${getApiBase()}/api/manual-payments?eventId.equals=${eventId}&tenantId.equals=${tenantId}&size=1000`;
    const manualPaymentsResponse = await fetchWithJwtRetry(manualPaymentsUrl, { cache: 'no-store' });
    
    if (!manualPaymentsResponse.ok) {
      console.warn('[Sales Analytics] Failed to fetch manual payment requests for fallback');
      return { summary: [], fromFallback: false };
    }

    const manualPayments: ManualPaymentRequestDTO[] = await manualPaymentsResponse.json();
    const manualPaymentsArray = Array.isArray(manualPayments) ? manualPayments : [];

    // Aggregate manual payment requests into summary format
    const aggregatedSummary: Record<string, ManualPaymentSummaryReportDTO> = {};
    
    manualPaymentsArray.forEach(payment => {
      const paymentMethodType = (payment as any).manualPaymentMethodType || (payment as any).paymentMethodType;
      const status = payment.status || 'REQUESTED';
      const snapshotDate = startDate ? startDate.split('T')[0] : new Date().toISOString().split('T')[0];
      
      // Create unique key: paymentMethodType + status + snapshotDate
      const key = `${paymentMethodType}_${status}_${snapshotDate}`;
      
      if (!aggregatedSummary[key]) {
        aggregatedSummary[key] = {
          tenantId,
          eventId: parseInt(eventId, 10),
          snapshotDate,
          manualPaymentMethodType: paymentMethodType as ManualPaymentMethodType,
          status: status as any,
          totalAmount: 0,
          requestCount: 0,
        };
      }
      
      aggregatedSummary[key].totalAmount += payment.amountDue || 0;
      aggregatedSummary[key].requestCount += 1;
    });

    const summaryArray = Object.values(aggregatedSummary);
    console.log(`[Sales Analytics] Aggregated ${summaryArray.length} summary records from manual_payment_request table`);
    return { summary: summaryArray, fromFallback: true };
  } catch (error) {
    console.error('[Sales Analytics] Error fetching manual payment summary:', error);
    return { summary: [], fromFallback: false };
  }
}

/**
 * Calculate sales metrics from transactions and summary tables
 * 
 * Data Sources:
 * - Stripe Payments: Query event_ticket_transaction directly (no summary table)
 * - Manual Payments: Use manual_payment_summary_report table, fallback to manual_payment_request if empty
 */
export async function calculateSalesMetricsServer(
  eventId: string,
  startDate?: string,
  endDate?: string
): Promise<SalesMetrics> {
  try {
    const tenantId = getTenantId();
    
    // Step 1 & 2: Fetch transactions and manual payment summary in parallel for better performance
    const stripeParams = new URLSearchParams({
      'eventId.equals': eventId,
      'size': '1000', // Get all for analytics
    });

    if (startDate) {
      stripeParams.append('purchaseDate.greaterThanOrEqual', startDate);
    }
    if (endDate) {
      stripeParams.append('purchaseDate.lessThanOrEqual', endDate);
    }

    const stripeUrl = `${getApiBase()}/api/event-ticket-transactions?${stripeParams.toString()}`;
    
    // Fetch both in parallel to reduce total time
    const [stripeResponse, manualPaymentSummaryResult] = await Promise.all([
      fetchWithJwtRetry(stripeUrl, { cache: 'no-store' }),
      fetchManualPaymentSummaryForAnalytics(eventId, startDate, endDate)
    ]);

    if (!stripeResponse.ok) {
      console.error(`[Sales Analytics] Failed to fetch transactions: ${stripeResponse.status} ${stripeResponse.statusText}`);
      throw new Error(`Failed to fetch sales metrics: ${stripeResponse.status} ${stripeResponse.statusText}`);
    }

    const allTransactions: EventTicketTransactionDTO[] = await stripeResponse.json();
    const transactionsArray = Array.isArray(allTransactions) ? allTransactions : [];
    console.log(`[Sales Analytics] Fetched ${transactionsArray.length} total transactions for eventId ${eventId}`);

    // Extract manual payment summary from parallel result
    const { summary: manualPaymentSummary, fromFallback } = manualPaymentSummaryResult;

  // Step 3: Separate Stripe and Manual transactions
  // Manual payments are identified by transactionReference prefix (MANUAL- or TKTN)
  const stripeTransactions = transactionsArray.filter(t => {
    const transactionRef = t.transactionReference || '';
    // Stripe transactions: NOT starting with MANUAL- or TKTN
    return !transactionRef.startsWith('MANUAL-') && !transactionRef.startsWith('TKTN');
  });

  const manualTransactions = transactionsArray.filter(t => {
    const transactionRef = t.transactionReference || '';
    // Manual transactions: Starting with MANUAL- or TKTN
    return transactionRef.startsWith('MANUAL-') || transactionRef.startsWith('TKTN');
  });

  // Step 4: Create payment method mapping from manual payment summary or requests
  // This is used to display payment method names in revenue breakdown
  const manualPaymentMethodMapByReference: Record<string, ManualPaymentMethodType> = {};
  
  // Build mapping from summary data or fallback to manual payment requests
  if (manualPaymentSummary.length > 0) {
    // Use summary data to build payment method mapping
    manualPaymentSummary.forEach(summary => {
      // Map by payment method type (we'll use this for display)
      // Note: Summary doesn't have transaction references, so we'll use payment method type directly
      const methodType = summary.manualPaymentMethodType || 'UNKNOWN';
      const count = summary.requestCount || 0;
      console.log(`[Sales Analytics] Summary record: ${methodType}, Status: ${summary.status}, Amount: ${summary.totalAmount}, Count: ${count}`);
    });
  } else if (fromFallback) {
    // If we used fallback, fetch manual payment requests to build transaction reference mapping
    try {
      const manualPaymentsUrl = `${getApiBase()}/api/manual-payments?eventId.equals=${eventId}&tenantId.equals=${tenantId}&size=1000`;
      const manualPaymentsResponse = await fetchWithJwtRetry(manualPaymentsUrl, { cache: 'no-store' });
      if (manualPaymentsResponse.ok) {
        const manualPayments: ManualPaymentRequestDTO[] = await manualPaymentsResponse.json();
        const manualPaymentsArray = Array.isArray(manualPayments) ? manualPayments : [];

        manualPaymentsArray.forEach(payment => {
          const paymentMethodType = (payment as any).manualPaymentMethodType || (payment as any).paymentMethodType;
          if (payment.id && paymentMethodType) {
            // Map transaction reference formats
            manualPaymentMethodMapByReference[`MANUAL-${payment.id}`] = paymentMethodType as ManualPaymentMethodType;
            if (payment.ticketTransactionId) {
              manualPaymentMethodMapByReference[`TKTN${payment.ticketTransactionId}`] = paymentMethodType as ManualPaymentMethodType;
            }
            // Also map actual transaction references from transactions
            manualTransactions.forEach(transaction => {
              if (transaction.id === payment.ticketTransactionId && transaction.transactionReference) {
                manualPaymentMethodMapByReference[transaction.transactionReference] = paymentMethodType as ManualPaymentMethodType;
              }
            });
          }
        });
      }
    } catch (error) {
      console.error('[Sales Analytics] Error fetching manual payment requests for mapping:', error);
    }
  }

  // Helper function to map payment method type to display name
  const getMethodDisplayName = (methodType: string): string => {
    const methodNameMap: Record<string, string> = {
      'ZELLE_MANUAL': 'Zelle',
      'VENMO_MANUAL': 'Venmo',
      'CASH_APP_MANUAL': 'Cash App',
      'PAYPAL_MANUAL': 'PayPal',
      'APPLE_PAY_MANUAL': 'Apple Pay',
      'GOOGLE_PAY_MANUAL': 'Google Pay',
      'CASH': 'Cash',
      'CASH_MANUAL': 'Cash',
      'CHECK': 'Check',
      'CHECK_MANUAL': 'Check',
      'WIRE_TRANSFER_MANUAL': 'Wire Transfer',
      'ACH_MANUAL': 'ACH',
      'OTHER_MANUAL': 'Other Manual Payment',
    };
    return methodNameMap[methodType] || methodType;
  };

  // Helper function to normalize Stripe payment method IDs to readable names
  const normalizeStripePaymentMethod = (paymentMethod: string): string => {
    if (!paymentMethod) return 'Unknown';
    
    // If it's a Stripe payment method ID (starts with pm_), normalize to "Card"
    // Stripe payment method IDs are not meaningful to users (e.g., pm_1SaTBpK5BrggeAHMD05AHc4H)
    if (paymentMethod.startsWith('pm_')) {
      return 'Card';
    }
    
    // If it's already a readable name (card, google_pay, apple_pay, etc.), return as-is
    const methodLower = paymentMethod.toLowerCase();
    if (methodLower.includes('card') || methodLower === 'card') {
      return 'Card';
    }
    if (methodLower.includes('google_pay') || methodLower.includes('google pay')) {
      return 'Google Pay';
    }
    if (methodLower.includes('apple_pay') || methodLower.includes('apple pay')) {
      return 'Apple Pay';
    }
    if (methodLower.includes('link')) {
      return 'Link';
    }
    
    // Return as-is if it's already a readable name
    return paymentMethod;
  };

  // Helper function to get payment method display name for a transaction
  const getPaymentMethodDisplayName = (transaction: EventTicketTransactionDTO): string => {
    // If transaction has paymentMethod set (Stripe payments), normalize it
    if (transaction.paymentMethod) {
      return normalizeStripePaymentMethod(transaction.paymentMethod);
    }

    // For manual payments, look up payment method from transaction reference
    const transactionRef = transaction.transactionReference;
    if (transactionRef) {
      // Try exact match first
      if (manualPaymentMethodMapByReference[transactionRef]) {
        const methodType = manualPaymentMethodMapByReference[transactionRef];
        return getMethodDisplayName(methodType);
      }

      // Check if this is a manual payment by prefix
      if (transactionRef.startsWith('MANUAL-') || transactionRef.startsWith('TKTN')) {
        // Try to extract payment method from summary data
        // For now, return generic "Manual Payment" if no mapping found
        return 'Unknown Manual Payment';
      }
    }

    // Check if this is a manual payment by prefix (fallback identification)
    const isManualPayment = transactionRef?.startsWith('MANUAL-') || transactionRef?.startsWith('TKTN');
    if (isManualPayment) {
      return 'Unknown Manual Payment';
    }

    return 'Unknown';
  };

  // Step 5: Filter transactions by status and payment type
  //
  // STRIPE PAYMENT FLOW:
  // - Status: COMPLETED immediately after successful payment
  // - Identification: transactionReference does NOT start with "MANUAL-" or "TKTN"
  // - Includes: All COMPLETED Stripe transactions
  //
  // MANUAL PAYMENT FLOW:
  // - Status: PENDING initially, COMPLETED after admin confirmation
  // - Identification: transactionReference starts with "MANUAL-" or "TKTN"
  // - Includes: PENDING manual transactions (pending requests) + COMPLETED manual transactions (confirmed)
  //
  // Filter Stripe transactions (COMPLETED only - Stripe never has PENDING)
  const confirmedStripeTransactions = stripeTransactions.filter(t => t.status === 'COMPLETED');

  // Filter Manual transactions (PENDING + COMPLETED)
  const confirmedManualTransactions = manualTransactions.filter(t => {
    // Include COMPLETED manual payments (after admin confirmation)
    if (t.status === 'COMPLETED') return true;
    // Include PENDING manual payments (pending requests)
    if (t.status === 'PENDING') return true;
    return false;
  });

  // Combine both transaction types
  const confirmedTransactions = [...confirmedStripeTransactions, ...confirmedManualTransactions];

  // Step 6: Calculate metrics from combined data sources
  // Stripe metrics come from transactions, Manual metrics come from summary (or transactions if summary unavailable)
  
  // Calculate Stripe metrics from transactions
  const stripeTotalTransactions = confirmedStripeTransactions.length;
  const stripeGrossRevenue = confirmedStripeTransactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  const stripeTotalRevenue = confirmedStripeTransactions.reduce((sum, t) => sum + (t.finalAmount || 0), 0);
  const stripeTotalDiscounts = confirmedStripeTransactions.reduce((sum, t) => sum + (t.discountAmount || 0), 0);
  const stripeTotalRefunds = confirmedStripeTransactions.reduce((sum, t) => sum + (t.refundAmount || 0), 0);
  const stripePlatformFees = confirmedStripeTransactions.reduce((sum, t) => sum + (t.platformFeeAmount || 0), 0);
  const stripeTaxAmount = confirmedStripeTransactions.reduce((sum, t) => sum + (t.taxAmount || 0), 0);

  // Calculate Manual metrics from summary (or transactions if summary unavailable)
  let manualTotalTransactions = 0;
  let manualGrossRevenue = 0;
  let manualTotalRevenue = 0;
  let manualTotalDiscounts = 0;
  let manualTotalRefunds = 0;
  let manualPlatformFees = 0;
  let manualTaxAmount = 0;

  if (manualPaymentSummary.length > 0) {
    // Use summary data for manual payments
    manualPaymentSummary.forEach(summary => {
      const count = (summary as any).transactionCount || summary.requestCount || 0;
      manualTotalTransactions += count;
      manualTotalRevenue += summary.totalAmount || 0;
      // Note: Summary table doesn't have gross revenue, discounts, refunds, platform fees, or tax
      // These would need to come from transactions if needed, or be set to 0 for manual payments
      manualGrossRevenue += summary.totalAmount || 0; // Approximate (summary only has totalAmount)
    });
  } else {
    // Fallback: Calculate from manual transactions
    manualTotalTransactions = confirmedManualTransactions.length;
    manualGrossRevenue = confirmedManualTransactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
    manualTotalRevenue = confirmedManualTransactions.reduce((sum, t) => sum + (t.finalAmount || 0), 0);
    manualTotalDiscounts = confirmedManualTransactions.reduce((sum, t) => sum + (t.discountAmount || 0), 0);
    manualTotalRefunds = confirmedManualTransactions.reduce((sum, t) => sum + (t.refundAmount || 0), 0);
    manualPlatformFees = confirmedManualTransactions.reduce((sum, t) => sum + (t.platformFeeAmount || 0), 0);
    manualTaxAmount = confirmedManualTransactions.reduce((sum, t) => sum + (t.taxAmount || 0), 0);
  }

  // Combine metrics from both sources
  const totalTransactions = stripeTotalTransactions + manualTotalTransactions;
  const grossRevenue = stripeGrossRevenue + manualGrossRevenue;
  const totalRevenue = stripeTotalRevenue + manualTotalRevenue;
  const totalDiscounts = stripeTotalDiscounts + manualTotalDiscounts;
  const totalRefunds = stripeTotalRefunds + manualTotalRefunds;
  const platformFees = stripePlatformFees + manualPlatformFees;
  const taxAmount = stripeTaxAmount + manualTaxAmount;

  // Net Revenue = Sum of netPayoutAmount (what event organizer receives after Stripe fees and tax)
  //
  // STRIPE PAYMENTS:
  // - Uses netPayoutAmount from batch job if available (most accurate)
  // - Otherwise: finalAmount - stripeFeeAmount - stripeAmountTax
  // - Stripe fees and taxes are deducted from final amount
  //
  // MANUAL PAYMENTS:
  // - stripeFeeAmount = NULL/0 (no Stripe fees)
  // - stripeAmountTax = NULL/0 (no Stripe tax)
  // - netPayoutAmount = NULL (not applicable)
  // - Net Revenue = finalAmount - 0 - 0 = finalAmount (correct - no fees deducted)
  //
  // This calculation correctly handles both payment types:
  // - Stripe: Deducts fees and taxes
  // - Manual: No fees deducted (fee-free payment method)
  const netRevenue = confirmedTransactions.reduce((sum, t) => {
    if (t.netPayoutAmount !== undefined && t.netPayoutAmount !== null) {
      // Use stored netPayoutAmount from batch job (most accurate - Stripe payments only)
      return sum + t.netPayoutAmount;
    } else {
      // Fallback calculation if netPayoutAmount not available
      const finalAmount = t.finalAmount || 0;
      const stripeFee = t.stripeFeeAmount || 0;  // NULL/0 for manual payments
      const stripeTax = t.stripeAmountTax || 0;  // NULL/0 for manual payments
      // Net revenue = final_amount - stripe_fee_amount - stripe_amount_tax
      // For Stripe: Deducts fees and taxes
      // For Manual: finalAmount - 0 - 0 = finalAmount (correct)
      return sum + (finalAmount - stripeFee - stripeTax);
    }
  }, 0);

  // Net Revenue Before Tax = Sum of (finalAmount - stripeFeeAmount) per transaction
  // Formula: net_revenue_before_tax = final_amount - stripe_fee_amount
  // This represents what you'd receive if tax wasn't part of the transaction
  //
  // STRIPE PAYMENTS:
  // - Net Revenue Before Tax = finalAmount - stripeFeeAmount
  // - Stripe processing fees are deducted
  //
  // MANUAL PAYMENTS:
  // - stripeFeeAmount = NULL/0 (no Stripe fees)
  // - Net Revenue Before Tax = finalAmount - 0 = finalAmount (correct - no fees)
  const netRevenueBeforeTax = confirmedTransactions.reduce((sum, t) => {
    const finalAmount = t.finalAmount || 0;
    const stripeFee = t.stripeFeeAmount || 0;  // NULL/0 for manual payments
    // Net revenue before tax = final_amount - stripe_fee_amount
    // For Stripe: Deducts Stripe fees
    // For Manual: finalAmount - 0 = finalAmount (correct)
    return sum + (finalAmount - stripeFee);
  }, 0);
  const averageTicketPrice = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Group by day (combine Stripe and Manual transactions)
  const salesByDayMap: Record<string, { count: number; revenue: number }> = {};
  confirmedTransactions.forEach(t => {
    if (t.purchaseDate) {
      const date = new Date(t.purchaseDate).toISOString().split('T')[0];
      if (!salesByDayMap[date]) {
        salesByDayMap[date] = { count: 0, revenue: 0 };
      }
      salesByDayMap[date].count += 1;
      salesByDayMap[date].revenue += t.finalAmount || 0;
    }
  });
  
  // Note: Manual payment summary has snapshotDate, but we're using transaction purchaseDate for day grouping
  // If summary data is used, we'd need to group by snapshotDate instead

  const salesByDay = Object.entries(salesByDayMap)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Group by hour
  const salesByHourMap: Record<string, { count: number; revenue: number }> = {};
  confirmedTransactions.forEach(t => {
    if (t.purchaseDate) {
      const date = new Date(t.purchaseDate);
      const hour = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      if (!salesByHourMap[hour]) {
        salesByHourMap[hour] = { count: 0, revenue: 0 };
      }
      salesByHourMap[hour].count += 1;
      salesByHourMap[hour].revenue += t.finalAmount || 0;
    }
  });

  const salesByHour = Object.entries(salesByHourMap)
    .map(([hour, data]) => ({ hour, ...data }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  // Group by discount code
  const discountCodeMap: Record<string, { usageCount: number; totalDiscount: number }> = {};
  confirmedTransactions.forEach(t => {
    if (t.discountCodeId && t.discountAmount) {
      const codeKey = `CODE_${t.discountCodeId}`;
      if (!discountCodeMap[codeKey]) {
        discountCodeMap[codeKey] = { usageCount: 0, totalDiscount: 0 };
      }
      discountCodeMap[codeKey].usageCount += 1;
      discountCodeMap[codeKey].totalDiscount += t.discountAmount;
    }
  });

  const discountCodeUsage = Object.entries(discountCodeMap).map(([code, data]) => ({
    code,
    ...data,
  }));

  // Sales by ticket type (would need transaction items - placeholder for now)
  const salesByTicketType: Array<{ ticketTypeName: string; count: number; revenue: number }> = [];

  // Revenue by payment method
  // Combine data from Stripe transactions and manual payment summary
  const revenueByPaymentMethod: Record<string, { count: number; revenue: number }> = {};
  
  // Add Stripe transaction revenue
  confirmedStripeTransactions.forEach(t => {
    const method = getPaymentMethodDisplayName(t);
    if (!revenueByPaymentMethod[method]) {
      revenueByPaymentMethod[method] = { count: 0, revenue: 0 };
    }
    revenueByPaymentMethod[method].count += 1;
    revenueByPaymentMethod[method].revenue += t.finalAmount || 0;
  });

  // Add manual payment revenue from summary table (or transactions if summary unavailable)
  if (manualPaymentSummary.length > 0) {
    // Use summary data for manual payments
    manualPaymentSummary.forEach(summary => {
      const methodName = getMethodDisplayName(summary.manualPaymentMethodType);
      if (!revenueByPaymentMethod[methodName]) {
        revenueByPaymentMethod[methodName] = { count: 0, revenue: 0 };
      }
      // Use transaction_count from summary (or requestCount if field name differs)
      const count = (summary as any).transactionCount || summary.requestCount || 0;
      revenueByPaymentMethod[methodName].count += count;
      revenueByPaymentMethod[methodName].revenue += summary.totalAmount || 0;
    });
  } else {
    // Fallback: Use manual transactions if summary unavailable
    confirmedManualTransactions.forEach(t => {
      const method = getPaymentMethodDisplayName(t);
      if (!revenueByPaymentMethod[method]) {
        revenueByPaymentMethod[method] = { count: 0, revenue: 0 };
      }
      revenueByPaymentMethod[method].count += 1;
      revenueByPaymentMethod[method].revenue += t.finalAmount || 0;
    });
  }

  // Sales by week
  const salesByWeekMap: Record<string, { count: number; revenue: number }> = {};
  confirmedTransactions.forEach(t => {
    if (t.purchaseDate) {
      const date = new Date(t.purchaseDate);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];
      if (!salesByWeekMap[weekKey]) {
        salesByWeekMap[weekKey] = { count: 0, revenue: 0 };
      }
      salesByWeekMap[weekKey].count += 1;
      salesByWeekMap[weekKey].revenue += t.finalAmount || 0;
    }
  });

  const salesByWeek = Object.entries(salesByWeekMap)
    .map(([week, data]) => ({ week, ...data }))
    .sort((a, b) => a.week.localeCompare(b.week));

  // Sales by month
  const salesByMonthMap: Record<string, { count: number; revenue: number }> = {};
  confirmedTransactions.forEach(t => {
    if (t.purchaseDate) {
      const date = new Date(t.purchaseDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!salesByMonthMap[monthKey]) {
        salesByMonthMap[monthKey] = { count: 0, revenue: 0 };
      }
      salesByMonthMap[monthKey].count += 1;
      salesByMonthMap[monthKey].revenue += t.finalAmount || 0;
    }
  });

  const salesByMonth = Object.entries(salesByMonthMap)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Manual payment status breakdown
  // Use summary data if available, otherwise use manual transactions
  const statusBreakdownMap: Record<string, { count: number; revenue: number }> = {};
  
  if (manualPaymentSummary.length > 0) {
    // Use summary data for status breakdown
    manualPaymentSummary.forEach(summary => {
      const status = summary.status || 'UNKNOWN';
      if (!statusBreakdownMap[status]) {
        statusBreakdownMap[status] = { count: 0, revenue: 0 };
      }
      // Use transaction_count from summary (or requestCount if field name differs)
      const count = (summary as any).transactionCount || summary.requestCount || 0;
      statusBreakdownMap[status].count += count;
      statusBreakdownMap[status].revenue += summary.totalAmount || 0;
    });
  } else {
    // Fallback: Use manual transactions if summary unavailable
    confirmedManualTransactions.forEach(t => {
      const status = t.status || 'UNKNOWN';
      if (!statusBreakdownMap[status]) {
        statusBreakdownMap[status] = { count: 0, revenue: 0 };
      }
      statusBreakdownMap[status].count += 1;
      statusBreakdownMap[status].revenue += t.finalAmount || 0;
    });
  }

  // Convert to array and sort by status (PENDING, RECEIVED, CONFIRMED, CANCELLED, REFUNDED, etc.)
  const statusOrder: Record<string, number> = {
    'PENDING': 1,
    'REQUESTED': 2,
    'RECEIVED': 3,
    'CONFIRMED': 4,
    'COMPLETED': 5,
    'CANCELLED': 6,
    'VOIDED': 7,
    'REFUNDED': 8,
  };
  const manualPaymentStatusBreakdown = Object.entries(statusBreakdownMap)
    .map(([status, data]) => ({ status, ...data }))
    .sort((a, b) => {
      const orderA = statusOrder[a.status] || 999;
      const orderB = statusOrder[b.status] || 999;
      return orderA - orderB;
    });

    return {
      eventId: parseInt(eventId, 10),
      totalTransactions,
      totalRevenue,
      grossRevenue,
      netRevenue,
      totalDiscounts,
      totalRefunds,
      platformFees,
      taxAmount,
      averageTicketPrice,
      netRevenueBeforeTax,
      salesByTicketType,
      salesByDay,
      salesByHour,
      salesByWeek,
      salesByMonth,
      revenueByPaymentMethod: Object.entries(revenueByPaymentMethod).map(([method, data]) => ({
        method,
        count: data.count,
        revenue: data.revenue,
      })),
      discountCodeUsage,
      manualPaymentStatusBreakdown,
    };
  } catch (error: any) {
    console.error('[Sales Analytics] Error in calculateSalesMetricsServer:', error);
    // Return empty metrics instead of throwing to prevent page crash
    // The error will be displayed in the UI via the error state
    throw new Error(error.message || 'Failed to calculate sales metrics. Please try again.');
  }
}

/**
 * Fetch event details to determine payment flow mode
 */
export async function fetchEventDetailsForPaymentFlow(eventId: number): Promise<EventDetailsDTO | null> {
  try {
    const tenantId = getTenantId();
    const url = `${getApiBase()}/api/event-details/${eventId}?tenantId.equals=${tenantId}`;
    const res = await fetchWithJwtRetry(url, { cache: 'no-store' });
    if (!res.ok) {
      console.error(`Failed to fetch event details for eventId ${eventId}:`, res.status);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`Error fetching event details for eventId ${eventId}:`, error);
    return null;
  }
}

/**
 * Trigger Stripe Fees and Tax Update Batch Job
 * This server action calls the backend batch job API to retrieve missing Stripe fee and tax data
 * and update transaction records asynchronously.
 *
 * NOTE: This batch job is ONLY for Stripe payments. It filters for transactions with stripe_payment_intent_id.
 * Manual payments do not need this batch job as they don't have Stripe fees.
 *
 * @param request - Batch job request parameters (all optional)
 * @returns Response with job ID and status (HTTP 202 Accepted)
 */
export async function triggerStripeFeesTaxUpdateServer(
  request: StripeFeesTaxUpdateRequest = {}
): Promise<StripeFeesTaxUpdateResponse> {
  try {
    // Validate date range if both dates are provided
    if (request.startDate && request.endDate) {
      const start = new Date(request.startDate);
      const end = new Date(request.endDate);
      if (start > end) {
        throw new Error('Start date must be before or equal to end date');
      }
    }

    // Prepare request payload (only include defined fields)
    const payload: StripeFeesTaxUpdateRequest = {};
    if (request.tenantId) {
      payload.tenantId = request.tenantId;
    }
    if (request.eventId !== undefined && request.eventId !== null) {
      payload.eventId = request.eventId;
    }
    if (request.startDate) {
      payload.startDate = request.startDate;
    }
    if (request.endDate) {
      payload.endDate = request.endDate;
    }
    if (request.forceUpdate !== undefined) {
      payload.forceUpdate = request.forceUpdate;
    }
    if (request.useDefaultDateRange !== undefined) {
      payload.useDefaultDateRange = request.useDefaultDateRange;
    }

    // Call backend batch job API endpoint (NOT a proxy endpoint - direct backend call)
    const url = `${getApiBase()}/api/cron/stripe-fees-tax-update`;
    const response = await fetchWithJwtRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    // Handle error responses
    if (!response.ok) {
      let errorMessage = 'Failed to trigger batch job. Please try again.';

      try {
        const errorData = await response.json();

        // Extract user-friendly error message from response
        if (errorData.message && typeof errorData.message === 'string') {
          // Check if it's a user-friendly message or a technical error code
          if (errorData.message.includes('error.') || errorData.message.includes('Error:') ||
              errorData.message.toLowerCase().includes('batchjob') ||
              errorData.message.toLowerCase().includes('batch')) {
            // Map technical error codes to user-friendly messages
            const messageLower = errorData.message.toLowerCase();
            if (messageLower.includes('batchjobhttperror') || messageLower.includes('batchjobunavailable')) {
              errorMessage = 'Unable to start the batch job. The batch job service may be unavailable. Please try again later or contact support.';
            } else if (messageLower.includes('batchjobsubmissionfailed')) {
              errorMessage = 'Failed to submit the batch job. The batch job service may be experiencing issues. Please try again in a few moments or contact support if the problem persists.';
            } else if (messageLower.includes('batchjob')) {
              errorMessage = 'An error occurred while starting the batch job. Please try again later or contact support.';
            } else if (errorData.message.includes('Invalid request')) {
              errorMessage = 'Invalid request parameters. Please check your input and try again.';
            } else if (errorData.message.includes('startDate') || errorData.message.includes('endDate')) {
              errorMessage = 'Invalid date range. Please ensure the start date is before or equal to the end date.';
            } else {
              // Try to extract a more user-friendly message
              errorMessage = errorData.message.replace(/error\./g, '').replace(/Error:/g, '').trim();
              if (!errorMessage || errorMessage.length < 10) {
                errorMessage = 'An error occurred while starting the batch job. Please try again.';
              }
            }
          } else {
            // Use the message as-is if it looks user-friendly
            errorMessage = errorData.message;
          }
        } else if (errorData.error && typeof errorData.error === 'string') {
          // Handle error field
          const errorLower = errorData.error.toLowerCase();
          if (errorData.error.includes('error.') || errorData.error.includes('Error:') ||
              errorLower.includes('batchjob') || errorLower.includes('batch')) {
            if (errorLower.includes('batchjobhttperror') || errorLower.includes('batchjobunavailable')) {
              errorMessage = 'Unable to start the batch job. The batch job service may be unavailable. Please try again later or contact support.';
            } else if (errorLower.includes('batchjobsubmissionfailed')) {
              errorMessage = 'Failed to submit the batch job. The batch job service may be experiencing issues. Please try again in a few moments or contact support if the problem persists.';
            } else if (errorLower.includes('batchjob')) {
              errorMessage = 'An error occurred while starting the batch job. Please try again later or contact support.';
            } else {
              errorMessage = errorData.error.replace(/error\./g, '').replace(/Error:/g, '').trim();
              if (!errorMessage || errorMessage.length < 10) {
                errorMessage = 'An error occurred while starting the batch job. Please try again.';
              }
            }
          } else {
            errorMessage = errorData.error;
          }
        } else if (response.status === 400) {
          errorMessage = 'Invalid request. Please check your parameters and try again.';
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please refresh the page and try again.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to trigger this batch job.';
        } else if (response.status === 404) {
          errorMessage = 'Batch job service not found. Please contact support.';
        } else if (response.status === 500) {
          errorMessage = 'Server error occurred. Please try again later or contact support.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error occurred. Please try again later or contact support.';
        }
      } catch (parseError) {
        // If JSON parsing fails, use status-based error messages
        if (response.status === 400) {
          errorMessage = 'Invalid request. Please check your parameters and try again.';
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please refresh the page and try again.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to trigger this batch job.';
        } else if (response.status === 404) {
          errorMessage = 'Batch job service not found. Please contact support.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error occurred. Please try again later or contact support.';
        } else {
          errorMessage = `Failed to trigger batch job (${response.status}). Please try again.`;
        }
      }

      throw new Error(errorMessage);
    }

    // Parse and return response (should be 202 Accepted)
    const data: StripeFeesTaxUpdateResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('[triggerStripeFeesTaxUpdateServer] Error:', error);
    throw error;
  }
}
