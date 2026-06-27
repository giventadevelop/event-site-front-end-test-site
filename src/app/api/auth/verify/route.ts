/**
 * Verify Token API Route
 *
 * Verifies JWT token validity
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getAuthJwtSecret } from '@/lib/env';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { message: 'Token is required' },
        { status: 400 }
      );
    }

    const secret = getAuthJwtSecret();
    const decoded = jwt.verify(token, secret);
    return NextResponse.json({ valid: true, decoded }, { status: 200 });
  } catch (error) {
    console.error('[API] Token verification error:', error);
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  }
}


