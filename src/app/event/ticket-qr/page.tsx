import { Suspense } from 'react';
import TicketQrClient from './TicketQrClient';
import MobileDebugConsole from '@/components/MobileDebugConsole';

interface PageProps {
  searchParams: Promise<{ pi?: string; session_id?: string }>;
}

export default async function TicketQrPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const pi = params.pi;
  const session_id = params.session_id;

  console.log('[QR PAGE SERVER] TicketQrPage component rendering');
  console.log('[QR PAGE SERVER] Search params:', { pi, session_id });
  console.log('[QR PAGE SERVER] Rendering TicketQrClient with props:', { initialPi: pi, initialSessionId: session_id });

  return (
    <Suspense fallback={
      <div>
        <MobileDebugConsole />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <TicketQrClient initialPi={pi} initialSessionId={session_id} />
    </Suspense>
  );
}