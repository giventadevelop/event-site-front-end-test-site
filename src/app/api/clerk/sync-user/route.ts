import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/lib/env';

/**
 * Clerk User Sync API Route
 *
 * Syncs Clerk-authenticated user to backend multi-tenant system.
 * Called after successful OAuth authentication.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clerkUserId, email, firstName, lastName, tenantId } = body;

    console.log('[Clerk Sync] Syncing user to backend:', { email, tenantId });

    // Call backend sync endpoint
    const backendUrl = getApiBaseUrl() || 'http://localhost:8080';
    const response = await fetch(`${backendUrl}/api/clerk/sync-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Id': tenantId,
      },
      body: JSON.stringify({
        clerkUserId,
        email,
        firstName,
        lastName,
        tenantId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Clerk Sync] Backend sync failed:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to sync user to backend', details: errorText },
        { status: response.status }
      );
    }

    console.log('[Clerk Sync] User synced successfully');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Clerk Sync] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
