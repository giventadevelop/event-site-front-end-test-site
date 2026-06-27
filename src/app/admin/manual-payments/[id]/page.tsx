import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import ManualPaymentDetailClient from './ManualPaymentDetailClient';
import { fetchManualPaymentByIdServer } from '../ApiServerActions';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ManualPaymentDetailPage({ params }: PageProps) {
  // Next.js 15+ requires awaiting params
  const resolvedParams = typeof params.then === 'function' ? await params : params;
  const paymentId = parseInt(resolvedParams.id);

  if (isNaN(paymentId)) {
    redirect('/admin/manual-payments');
  }

  // Fetch payment data
  let payment = null;
  let error = null;
  try {
    payment = await fetchManualPaymentByIdServer(paymentId);
    if (!payment) {
      redirect('/admin/manual-payments');
    }
  } catch (err: any) {
    error = err.message || 'Failed to load manual payment';
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '120px' }}>
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <Suspense fallback={<div className="text-center py-8">Loading payment details...</div>}>
          <ManualPaymentDetailClient
            initialPayment={payment}
            initialError={error}
          />
        </Suspense>
      </div>
    </div>
  );
}
