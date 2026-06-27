import { Suspense } from 'react';
import { MembershipQrClient } from './MembershipQrClient';

interface MembershipQrPageProps {
  searchParams: Promise<{ pi?: string; session_id?: string }>;
}

export default async function MembershipQrPage({ searchParams }: MembershipQrPageProps) {
  // Next.js 15+ requires awaiting searchParams
  const resolvedSearchParams = typeof searchParams.then === 'function' ? await searchParams : searchParams;
  const { pi, session_id } = resolvedSearchParams;

  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <MembershipQrClient payment_intent={pi || ''} session_id={session_id || ''} />
    </Suspense>
  );
}








