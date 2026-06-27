import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import DonationSuccessClient from './DonationSuccessClient';

interface SuccessPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    transactionId?: string;
    donationId?: string;
  }>;
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="animate-pulse text-center">
          <div className="h-16 bg-gray-200 rounded-full w-16 mx-auto mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

export default async function DonationSuccessPage({ params, searchParams }: SuccessPageProps) {
  // Next.js 15+ requires awaiting params and searchParams
  const resolvedParams = typeof params.then === 'function' ? await params : params;
  const resolvedSearchParams = typeof searchParams.then === 'function' ? await searchParams : searchParams;
  
  const eventId = resolvedParams.id;
  const { transactionId, donationId } = resolvedSearchParams;

  if (!transactionId && !donationId) {
    notFound();
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DonationSuccessClient
        eventId={eventId}
        initialTransactionId={transactionId}
        initialDonationId={donationId}
      />
    </Suspense>
  );
}
