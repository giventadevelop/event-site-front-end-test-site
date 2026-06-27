import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { getTenantId, getApiBaseUrl } from '@/lib/env';

export async function POST(req: NextRequest) {
  try {
    console.log('[GENERATE-EMAIL-TOKEN] 🚀 Generate email token API called');

    // Get the authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { email, tenantId } = body;

    if (!email || !tenantId) {
      return NextResponse.json(
        { success: false, message: 'Email and tenantId are required' },
        { status: 400 }
      );
    }

    // Get API base URL
    const apiBaseUrl = getApiBaseUrl();
    if (!apiBaseUrl) {
      throw new Error('API base URL not configured');
    }

    // Get JWT token for backend calls
    let jwtToken = await getCachedApiJwt();
    if (!jwtToken) {
      jwtToken = await generateApiJwt();
    }

    // Generate a simple token for email subscription operations
    // In a real implementation, this would be a proper JWT token
    const emailToken = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('[GENERATE-EMAIL-TOKEN] ✅ Email token generated:', emailToken);

    return NextResponse.json({
      success: true,
      token: emailToken,
      message: 'Email token generated successfully'
    });

  } catch (error) {
    console.error('[GENERATE-EMAIL-TOKEN] ❌ Error generating email token:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate email token',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}











































