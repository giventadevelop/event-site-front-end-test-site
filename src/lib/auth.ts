import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from "@clerk/nextjs/server";

// Force Node.js runtime
export const runtime = 'nodejs';

export async function authenticatedRequest(
  req: NextRequest,
  handler: (userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Initialize auth at runtime
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return await handler(userId);
  } catch (error) {
    console.error('Authentication error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function getServerAuth() {
  // Get auth directly - no need to await headers() if not using them
  const session = await auth();
  return session;
}

export async function getUserAuth() {
  const { userId, sessionClaims } = await getServerAuth();
  return {
    session: {
      user: {
        id: userId,
        ...sessionClaims,
      },
    },
  };
}