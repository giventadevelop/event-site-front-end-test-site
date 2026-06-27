"use client";
import { useEffect, useState } from 'react';

interface LoadingTicketProps {
  sessionId?: string;
}

export default function LoadingTicket({ sessionId }: LoadingTicketProps) {
  const [mounted, setMounted] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState<string>("/images/default_placeholder_hero_image.jpeg");

  // Mark as mounted to prevent hydration mismatch
  useEffect(() => {
    console.log('LoadingTicket: Component mounted on client');
    setMounted(true);
  }, []);

  // Fetch hero image data using the success process endpoint
  useEffect(() => {
    console.log('LoadingTicket: useEffect RUNNING - sessionId:', sessionId);
    console.log('LoadingTicket: Window available:', typeof window !== 'undefined');

    if (sessionId && mounted) {
      const fetchHeroImage = async () => {
        try {
          console.log('LoadingTicket: Fetching hero image for session:', sessionId);

          // Get the pi parameter from URL if available
          const url = new URL(window.location.href);
          const pi = url.searchParams.get('pi');
          const qs = sessionId ? `session_id=${encodeURIComponent(sessionId)}` : (pi ? `pi=${encodeURIComponent(pi)}` : '');

          if (!qs) {
            console.log('LoadingTicket: No session_id or pi available');
            return;
          }

          // Use the same endpoint as the success page to get event details and hero image
          const response = await fetch(`/api/event/success/process?${qs}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          });

          if (response.ok) {
            const data = await response.json();
            console.log('LoadingTicket: Response data:', {
              hasTransaction: !!data.transaction,
              hasEventDetails: !!data.eventDetails,
              hasHeroImageUrl: !!data.heroImageUrl
            });

            if (data.heroImageUrl) {
              setHeroImageUrl(data.heroImageUrl);
              console.log('LoadingTicket: Successfully fetched hero image URL:', data.heroImageUrl);
            } else {
              console.log('LoadingTicket: No hero image URL in response');
            }
          } else {
            console.error('LoadingTicket: Failed to get success process data:', response.status);
          }
        } catch (error) {
          console.error('LoadingTicket: Failed to fetch hero image:', error);
        }
      };
      fetchHeroImage();
    }
  }, [sessionId, mounted]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* HERO SECTION - Only show after mounted to avoid hydration issues */}
      {mounted && (
        <div className="relative w-full overflow-hidden bg-transparent" style={{ minHeight: '400px', paddingTop: '80px' }}>
          <img
            src={heroImageUrl}
            alt="Event Hero"
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              objectFit: 'cover',
              margin: '0 auto'
            }}
            onLoad={() => console.log('Hero image loaded')}
            onError={(e) => console.error('Hero image error:', e)}
          />
        </div>
      )}

      {/* Loading content - Always rendered the same on SSR and client */}
      <div className="flex-grow flex flex-col items-center justify-center p-6 animate-pulse" style={{ marginTop: '200px', paddingTop: '60px' }}>
        <img
          src="/images/selling-tickets-vector-loading-image.jpg"
          alt="Ticket Loading"
          width="180"
          height="180"
          className="mb-4 rounded shadow-lg"
        />
        <div className="text-xl font-bold text-teal-700 mb-2">
          Processing your payment and generating your QR code
        </div>
        <div className="text-gray-600 text-base text-center">
          This may take a few moments.<br />Please do not close or refresh this page.
        </div>
      </div>
    </div>
  );
}