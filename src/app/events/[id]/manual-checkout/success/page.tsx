import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import ManualPaymentSuccessClient from './ManualPaymentSuccessClient';
import { fetchManualPaymentRequestServer } from './ApiServerActions';

interface ManualPaymentSuccessPageProps {
  params: {
    id: string;
  };
  searchParams: {
    requestId?: string;
  };
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="animate-pulse text-center">
            <div className="h-16 bg-gray-200 rounded-full w-16 mx-auto mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ManualPaymentSuccessPage({
  params,
  searchParams,
}: ManualPaymentSuccessPageProps) {
  // Next.js 15+ requires awaiting params
  const resolvedParams = typeof params.then === 'function' ? await params : params;
  const resolvedSearchParams = typeof searchParams.then === 'function' ? await searchParams : searchParams;

  const eventId = resolvedParams.id;
  const requestIdParam = resolvedSearchParams.requestId;

  if (!requestIdParam) {
    // Redirect to manual checkout if no requestId provided
    redirect(`/events/${eventId}/manual-checkout`);
  }

  const requestId = parseInt(requestIdParam);
  if (isNaN(requestId)) {
    redirect(`/events/${eventId}/manual-checkout`);
  }

  // Fetch payment request data
  const paymentData = await fetchManualPaymentRequestServer(requestId);

  if (!paymentData || !paymentData.paymentRequest) {
    // Payment request not found, redirect to checkout
    redirect(`/events/${eventId}/manual-checkout`);
  }

  // Verify event ID matches
  if (paymentData.paymentRequest.eventId !== parseInt(eventId)) {
    redirect(`/events/${eventId}/manual-checkout`);
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ManualPaymentSuccessClient
        requestId={requestId}
        eventId={parseInt(eventId)}
        initialPaymentRequest={paymentData.paymentRequest}
        initialTicketTransaction={paymentData.ticketTransaction}
        initialEvent={paymentData.event}
      />
    </Suspense>
  );
}
