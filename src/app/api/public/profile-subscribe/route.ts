import { NextRequest, NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import type { ProfileAudienceSubscribeRequestDTO } from '@/types/profileSite';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ProfileAudienceSubscribeRequestDTO;
    if (!body?.email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const url = `${getApiBaseUrl()}/api/profile-audience-contacts/public/subscribe`;
    const res = await fetchWithJwtRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'application/json' },
    });
  } catch (error) {
    console.error('[profile-subscribe]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
