'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function TrainingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Training] Route error:', error?.message, error?.stack);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 bg-syro-bg-gray">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 border border-syro-red/20 text-center">
        <h1 className="font-syro-display text-xl font-semibold text-syro-blue mb-2">
          Something went wrong
        </h1>
        <p className="font-syro-primary text-syro-dark-gray mb-4 text-sm">
          {error?.message || 'An error occurred loading the Training page.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 bg-syro-red text-white font-syro-primary font-medium rounded-lg hover:bg-syro-red/90"
          >
            Try again
          </button>
          <Link
            href="/mosc"
            className="px-4 py-2 bg-syro-blue/10 text-syro-blue font-syro-primary font-medium rounded-lg hover:bg-syro-blue/20"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
