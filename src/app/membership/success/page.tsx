import { Suspense } from 'react';
import { MembershipSuccessClient } from './MembershipSuccessClient';

interface MembershipSuccessPageProps {
  searchParams: Promise<{ pi?: string; session_id?: string }>;
}

export default async function MembershipSuccessPage({ searchParams }: MembershipSuccessPageProps) {
  // Next.js 15+ requires awaiting searchParams
  const resolvedSearchParams = typeof searchParams.then === 'function' ? await searchParams : searchParams;
  const { pi, session_id } = resolvedSearchParams;

  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <MembershipSuccessClient payment_intent={pi || ''} session_id={session_id || ''} />
    </Suspense>
  );
}








