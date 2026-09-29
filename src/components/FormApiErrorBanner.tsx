'use client';

import type { FormattedBackendError } from '@/lib/api/formatBackendError';

export function FormApiErrorBanner({
  error,
  heading,
}: {
  error: FormattedBackendError;
  heading?: string;
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 min-w-0 flex-1">
          <h3 className="text-sm font-medium text-red-800">{heading || error.title}</h3>
          <p className="mt-2 text-sm text-red-700 whitespace-pre-wrap">{error.message}</p>
          {error.detail && error.detail !== error.message && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium text-red-800">
                Technical details
              </summary>
              <pre className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap break-words text-xs text-red-900 bg-white/70 border border-red-200 rounded-md p-2">
                {error.detail}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
