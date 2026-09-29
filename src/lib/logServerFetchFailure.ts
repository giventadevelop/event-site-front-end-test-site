/**
 * Node/undici throws TypeError with message "fetch failed".
 * Next.js 16's overlay treats `console.error(thatError)` as a Console TypeError
 * even when the caller already handled it.
 */

export function isNetworkFetchFailure(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message === 'fetch failed' ||
    message === 'failed to fetch' ||
    message.includes('econnrefused') ||
    message.includes('enotfound')
  );
}

/** Log a handled fetch failure as a string so the Next 16 overlay does not pop. */
export function logServerFetchFailure(context: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  const cause =
    error instanceof Error && error.cause instanceof Error
      ? error.cause.message
      : error instanceof Error && error.cause != null
        ? String(error.cause)
        : undefined;
  const detail = cause ? `${message} (${cause})` : message;
  console.warn(`[${context}] ${detail}`);
}
