import { auth } from '@clerk/nextjs/server';

const CLERK_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? process.env.AMPLIFY_NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

/**
 * Safe wrapper around Clerk's auth() that never throws.
 * Returns { userId: null } when Clerk is not configured or auth fails.
 *
 * Use this in server components to avoid crashes when:
 * - Clerk middleware is disabled (empty matcher)
 * - Clerk is not configured (no publishable key)
 * - Auth session is not available (e.g., Amplify Lambda)
 */
export async function safeAuth(): Promise<{ userId: string | null }> {
  if (!CLERK_KEY) {
    return { userId: null };
  }
  try {
    const result = await auth();
    return { userId: result?.userId || null };
  } catch (error) {
    console.warn('[safeAuth] Auth check failed:', error);
    return { userId: null };
  }
}
