"use server";

import { unstable_noStore } from 'next/cache';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import type { ManualPaymentRequestDTO, ManualPaymentSummaryReportDTO } from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

if (!getApiBase()) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured');
}

export interface ManualPaymentListOptions {
  eventId?: string;
  status?: string;
  manualPaymentMethodType?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}

export interface ManualPaymentListResponse {
  payments: ManualPaymentRequestDTO[];
  totalCount: number;
}

/**
 * Fetch manual payment requests with pagination and filtering
 */
export async function fetchManualPaymentsServer(
  options: ManualPaymentListOptions = {}
): Promise<ManualPaymentListResponse> {
  unstable_noStore(); // Ensure fresh data on every call
  const params = new URLSearchParams();

  if (options.eventId) {
    params.append('eventId.equals', options.eventId);
  }

  if (options.status) {
    params.append('status.equals', options.status);
  }

  if (options.manualPaymentMethodType) {
    params.append('paymentMethodType.equals', options.manualPaymentMethodType);
  }

  const page = options.page ?? 0;
  const pageSize = options.pageSize ?? 20;
  params.append('page', page.toString());
  params.append('size', pageSize.toString());

  if (options.sort) {
    params.append('sort', options.sort);
  } else {
    params.append('sort', 'createdAt,desc');
  }

  const url = `${getApiBase()}/api/manual-payments?${params.toString()}`;
  const response = await fetchWithJwtRetry(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to fetch manual payments: ${response.status} ${response.statusText}`);
  }

  let payments: any;
  try {
    payments = await response.json();
  } catch (jsonError) {
    console.error('[ApiServerActions] Error parsing JSON response:', jsonError);
    const text = await response.text();
    console.error('[ApiServerActions] Response text:', text.substring(0, 500));
    throw new Error(`Failed to parse response: ${jsonError}`);
  }

  const totalCountHeader = response.headers.get('x-total-count');
  const totalCount = parseInt(totalCountHeader || '0', 10);

  const paymentsArray = Array.isArray(payments) ? payments : [];
  
  console.log('[ApiServerActions] fetchManualPaymentsServer response (before mapping):', {
    isArray: Array.isArray(payments),
    paymentsLength: paymentsArray.length,
    totalCountHeader,
    totalCount,
    firstPayment: paymentsArray.length > 0 ? { 
      id: paymentsArray[0].id, 
      eventId: paymentsArray[0].eventId,
      paymentMethodType: paymentsArray[0].paymentMethodType,
      payment_method_type: paymentsArray[0].payment_method_type
    } : 'none',
    responseType: typeof payments,
    responseKeys: Array.isArray(payments) ? 'array' : Object.keys(payments || {})
  });

  // Map backend field names to frontend DTO field names for each payment
  // Database: payment_method_type → Backend: paymentMethodType → Frontend: manualPaymentMethodType
  const mappedPayments = paymentsArray.map((payment: any) => {
    const mapped: any = { ...payment };
    // Map paymentMethodType → manualPaymentMethodType
    // Handle both backend DTO field name (paymentMethodType) and potential database field name (payment_method_type)
    if (mapped.paymentMethodType && !mapped.manualPaymentMethodType) {
      mapped.manualPaymentMethodType = mapped.paymentMethodType;
    } else if (mapped.payment_method_type && !mapped.manualPaymentMethodType) {
      mapped.manualPaymentMethodType = mapped.payment_method_type;
    }
    return mapped;
  });

  const result = {
    payments: mappedPayments,
    totalCount,
  };

  console.log('[ApiServerActions] Returning result (after mapping):', {
    paymentsCount: result.payments.length,
    totalCount: result.totalCount,
    firstPaymentMapped: result.payments.length > 0 ? {
      id: result.payments[0].id,
      eventId: result.payments[0].eventId,
      manualPaymentMethodType: result.payments[0].manualPaymentMethodType
    } : 'none'
  });

  return result;
}

/**
 * Create a new manual payment request
 */
export async function createManualPaymentRequestServer(
  paymentRequest: Omit<ManualPaymentRequestDTO, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ManualPaymentRequestDTO> {
  const url = `${getApiBase()}/api/manual-payments`;

  // Backend expects paymentMethodType (not manualPaymentMethodType) and tenantId
  // Map frontend DTO to backend DTO format
  const { manualPaymentMethodType, ...rest } = paymentRequest;
  const backendPayload: any = {
    ...rest,
    // Map manualPaymentMethodType to paymentMethodType for backend
    paymentMethodType: manualPaymentMethodType,
  };

  console.log('[createManualPaymentRequestServer] Sending payload to backend:', {
    ...backendPayload,
    paymentMethodType: backendPayload.paymentMethodType,
    tenantId: backendPayload.tenantId,
  });

  const response = await fetchWithJwtRetry(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(backendPayload),
    cache: 'no-store',
  });

  if (!response.ok) {
    let errorData: any = {};
    try {
      const text = await response.text();
      errorData = text ? JSON.parse(text) : {};
    } catch (e) {
      // If JSON parsing fails, use empty object
      errorData = {};
    }

    console.error('[createManualPaymentRequestServer] Backend error:', {
      status: response.status,
      errorData,
      payload: backendPayload,
    });

    // Extract user-friendly error message from backend response
    let userMessage = 'Failed to create payment request. Please try again.';

    if (response.status === 400) {
      // Validation errors - extract field-specific messages
      if (errorData.message) {
        if (errorData.message.includes('paymentMethodType') || errorData.message.includes('payment_method_type')) {
          userMessage = 'Please select a payment method.';
        } else if (errorData.message.includes('tenantId') || errorData.message.includes('tenant_id')) {
          userMessage = 'An internal error occurred. Please refresh the page and try again.';
        } else if (errorData.message.includes('amount') || errorData.message.includes('amountDue')) {
          userMessage = 'Please select at least one ticket.';
        } else if (errorData.message.includes('validation') || errorData.message.includes('Validation')) {
          userMessage = 'Please check all required fields and try again.';
        } else {
          userMessage = errorData.message;
        }
      } else if (errorData.errors && Array.isArray(errorData.errors)) {
        // Spring Boot validation errors format
        const validationErrors = errorData.errors.map((err: any) => {
          if (err.field === 'paymentMethodType' || err.field === 'payment_method_type') {
            return 'Please select a payment method.';
          } else if (err.field === 'tenantId' || err.field === 'tenant_id') {
            return 'An internal error occurred. Please refresh the page and try again.';
          } else if (err.field === 'amount' || err.field === 'amountDue') {
            return 'Please select at least one ticket.';
          }
          return err.defaultMessage || err.message || 'Please check this field.';
        });
        userMessage = validationErrors.join(' ');
      }
    } else if (response.status === 500) {
      userMessage = 'A server error occurred. Please try again in a few moments. If the problem persists, please contact support.';
    } else if (response.status === 401 || response.status === 403) {
      userMessage = 'Authentication error. Please refresh the page and try again.';
    } else if (response.status >= 500) {
      userMessage = 'The server is temporarily unavailable. Please try again in a few moments.';
    } else if (errorData.message) {
      userMessage = errorData.message;
    }

    const error = new Error(userMessage);
    (error as any).status = response.status;
    (error as any).errorData = errorData;
    throw error;
  }

  const responseData = await response.json();
  // Map backend response back to frontend DTO format
  if (responseData.paymentMethodType && !responseData.manualPaymentMethodType) {
    responseData.manualPaymentMethodType = responseData.paymentMethodType;
  }
  return responseData;
}

/**
 * Fetch a single manual payment request by ID
 */
export async function fetchManualPaymentByIdServer(paymentId: number): Promise<ManualPaymentRequestDTO | null> {
  const url = `${getApiBase()}/api/manual-payments/${paymentId}`;
  const response = await fetchWithJwtRetry(url, { cache: 'no-store' });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch manual payment: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  // Map backend response to frontend DTO format
  if (data.paymentMethodType && !data.manualPaymentMethodType) {
    data.manualPaymentMethodType = data.paymentMethodType;
  }
  return data;
}

/**
 * Update manual payment request status
 */
export async function updateManualPaymentStatusServer(
  paymentId: number,
  status: 'REQUESTED' | 'RECEIVED' | 'VOIDED' | 'CANCELLED',
  receivedBy?: string,
  voidReason?: string
): Promise<ManualPaymentRequestDTO> {
  const url = `${getApiBase()}/api/manual-payments/${paymentId}`;

  const payload: any = {
    id: paymentId,
    status,
  };

  // Only set receivedAt for RECEIVED status
  if (status === 'RECEIVED') {
    payload.receivedAt = new Date().toISOString();
    if (receivedBy) {
      payload.receivedBy = receivedBy;
    }
  }

  // Set voidReason for VOIDED or CANCELLED status
  if ((status === 'VOIDED' || status === 'CANCELLED') && voidReason) {
    payload.voidReason = voidReason;
  }

  // Clear receivedAt and receivedBy when resetting to REQUESTED
  if (status === 'REQUESTED') {
    payload.receivedAt = null;
    payload.receivedBy = null;
  }

  const response = await fetchWithJwtRetry(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/merge-patch+json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to update manual payment status: ${response.status}`);
  }

  const data = await response.json();
  // Map backend response to frontend DTO format
  if (data.paymentMethodType && !data.manualPaymentMethodType) {
    data.manualPaymentMethodType = data.paymentMethodType;
  }
  return data;
}

/**
 * Update manual payment request (full update with all editable fields)
 * CRITICAL: Must include all required fields (status, tenantId, createdAt) for backend validation
 */
export async function updateManualPaymentServer(
  paymentId: number,
  updates: Partial<ManualPaymentRequestDTO>
): Promise<ManualPaymentRequestDTO> {
  // First, fetch the current payment to get all required fields
  const currentPayment = await fetchManualPaymentByIdServer(paymentId);
  if (!currentPayment) {
    throw new Error('Payment not found');
  }

  const url = `${getApiBase()}/api/manual-payments/${paymentId}`;
  const tenantId = getTenantId();

  // Map frontend DTO to backend DTO format
  const { manualPaymentMethodType, status, tenantId: updateTenantId, createdAt: updateCreatedAt, ...rest } = updates;
  
  // Build payload starting with required fields from current payment
  const backendPayload: any = {
    id: paymentId,
    // CRITICAL: Include required fields that backend validation expects
    // Use tenantId from environment (multi-tenant security) - never allow override
    tenantId: tenantId,
    // Preserve current status if not being updated, otherwise use update value
    status: status || currentPayment.status,
    // Preserve createdAt (immutable) - never allow override
    createdAt: currentPayment.createdAt,
    // Always update timestamp
    updatedAt: new Date().toISOString(),
    // Include other required fields from current payment
    eventId: currentPayment.eventId,
    ticketTransactionId: currentPayment.ticketTransactionId,
    // Include editable fields from updates (excluding already handled fields)
    ...rest,
  };

  // Map manualPaymentMethodType to paymentMethodType for backend
  if (manualPaymentMethodType) {
    backendPayload.paymentMethodType = manualPaymentMethodType;
  } else if (currentPayment.manualPaymentMethodType) {
    // Preserve current payment method if not being updated
    backendPayload.paymentMethodType = currentPayment.manualPaymentMethodType;
  }

  // Filter out null/undefined values to avoid sending 'null' strings
  const filteredPayload: any = {};
  for (const [key, value] of Object.entries(backendPayload)) {
    if (value !== null && value !== undefined && value !== 'null') {
      filteredPayload[key] = value;
    }
  }

  console.log('[updateManualPaymentServer] Sending payload:', {
    paymentId,
    tenantId: filteredPayload.tenantId,
    status: filteredPayload.status,
    hasCreatedAt: !!filteredPayload.createdAt,
    hasUpdatedAt: !!filteredPayload.updatedAt,
    paymentMethodType: filteredPayload.paymentMethodType,
    amountDue: filteredPayload.amountDue,
    fieldsCount: Object.keys(filteredPayload).length
  });

  const response = await fetchWithJwtRetry(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/merge-patch+json',
    },
    body: JSON.stringify(filteredPayload),
    cache: 'no-store',
  });

  if (!response.ok) {
    let errorMessage = 'Failed to update payment. Please try again.';
    try {
      const errorData = await response.json();
      console.error('[updateManualPaymentServer] Backend error:', {
        status: response.status,
        errorData,
        payload: filteredPayload
      });

      // Extract user-friendly error message
      if (errorData.message) {
        if (errorData.message.includes('status') || errorData.message.includes('Status')) {
          errorMessage = 'Payment status is required. Please refresh the page and try again.';
        } else if (errorData.message.includes('tenantId') || errorData.message.includes('tenant_id')) {
          errorMessage = 'An internal error occurred. Please refresh the page and try again.';
        } else if (errorData.message.includes('createdAt') || errorData.message.includes('created_at')) {
          errorMessage = 'An internal error occurred. Please refresh the page and try again.';
        } else if (errorData.message.includes('validation') || errorData.message.includes('Validation')) {
          errorMessage = 'Please check all required fields and try again.';
        } else {
          errorMessage = errorData.message;
        }
      } else if (response.status === 400) {
        errorMessage = 'Invalid data. Please check all fields and try again.';
      } else if (response.status === 500) {
        errorMessage = 'A server error occurred. Please try again in a few moments.';
      }
    } catch (parseError) {
      console.error('[updateManualPaymentServer] Error parsing error response:', parseError);
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  // Map backend response to frontend DTO format
  if (data.paymentMethodType && !data.manualPaymentMethodType) {
    data.manualPaymentMethodType = data.paymentMethodType;
  }
  return data;
}

/**
 * Fetch manual payment summary report
 * CRITICAL: Always include tenantId filter for multi-tenant security
 */
export async function fetchManualPaymentSummaryServer(
  eventId?: string,
  startDate?: string,
  endDate?: string
): Promise<ManualPaymentSummaryReportDTO[]> {
  const params = new URLSearchParams();
  const tenantId = getTenantId();

  // CRITICAL: Always filter by tenantId for multi-tenant security
  params.append('tenantId.equals', tenantId);

  if (eventId) {
    params.append('eventId.equals', eventId);
  }

  if (startDate) {
    params.append('snapshotDate.greaterThanOrEqual', startDate);
  }

  if (endDate) {
    params.append('snapshotDate.lessThanOrEqual', endDate);
  }

  // Add size limit for performance
  params.append('size', '1000');

  const url = `${getApiBase()}/api/manual-payment-summary?${params.toString()}`;
  const response = await fetchWithJwtRetry(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to fetch manual payment summary: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const summaryArray = Array.isArray(data) ? data : [];
  
  // Map backend field names to frontend DTO field names
  // Database: payment_method_type → Backend: paymentMethodType → Frontend: manualPaymentMethodType
  // Database: transaction_count → Backend: transactionCount → Frontend: requestCount
  const mappedSummary = summaryArray.map((item: any) => {
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
    return mapped;
  });
  
  console.log('[fetchManualPaymentSummaryServer] Summary fetched (before mapping):', {
    eventId,
    tenantId,
    count: summaryArray.length,
    sampleRecord: summaryArray.length > 0 ? {
      id: summaryArray[0].id,
      paymentMethodType: summaryArray[0].paymentMethodType,
      payment_method_type: summaryArray[0].payment_method_type,
      transactionCount: summaryArray[0].transactionCount,
      transaction_count: summaryArray[0].transaction_count,
      status: summaryArray[0].status,
      totalAmount: summaryArray[0].totalAmount
    } : null
  });
  
  console.log('[fetchManualPaymentSummaryServer] Summary mapped (after mapping):', {
    eventId,
    tenantId,
    count: mappedSummary.length,
    records: mappedSummary.map((item: any) => ({
      id: item.id,
      paymentMethod: item.manualPaymentMethodType,
      status: item.status,
      totalAmount: item.totalAmount,
      requestCount: item.requestCount
    }))
  });

  return mappedSummary;
}

/**
 * Fetch available manual payment methods for tenant
 */
export async function fetchManualPaymentMethodsServer(): Promise<Array<{ providerName: string; enabled: boolean; config?: any }>> {
  const url = `${getApiBase()}/api/manual-payment-methods`;
  const response = await fetchWithJwtRetry(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to fetch manual payment methods: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Manual Payment Summary Batch Job Request/Response Types
 */
export interface ManualPaymentSummaryBatchJobRequest {
  tenantId?: string;
  eventId?: number;
  startDate?: string;
  endDate?: string;
  forceUpdate?: boolean;
}

export interface ManualPaymentSummaryBatchJobResponse {
  jobId: string;
  status: string;
  message: string;
  estimatedRecords?: number | null;
  estimatedCompletionTime?: string;
}

/**
 * Trigger Manual Payment Summary Batch Job
 * This server action calls the backend batch job API to aggregate manual payment data
 * into the summary report table for analytics and reporting.
 */
export async function triggerManualPaymentSummaryBatchJobServer(
  request: ManualPaymentSummaryBatchJobRequest = {}
): Promise<ManualPaymentSummaryBatchJobResponse> {
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
    const payload: ManualPaymentSummaryBatchJobRequest = {};
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

    // Call backend batch job API endpoint (NOT a proxy endpoint - direct backend call)
    const url = `${getApiBase()}/api/cron/manual-payment-summary`;
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
          errorMessage = errorData.message;
        } else if (errorData.error && typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (response.status === 400) {
          errorMessage = 'Invalid request. Please check your parameters and try again.';
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please refresh the page and try again.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to trigger this batch job.';
        } else if (response.status === 404) {
          errorMessage = 'Batch job service not found. Please contact support.';
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
    const data: ManualPaymentSummaryBatchJobResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('[triggerManualPaymentSummaryBatchJobServer] Error:', error);
    throw error;
  }
}
