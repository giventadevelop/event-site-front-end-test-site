import { NextRequest, NextResponse } from 'next/server';
import type { UserProfileDTO } from '@/types';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';

export async function PATCH(req: NextRequest) {
  try {
    const payload = await req.json() as Partial<UserProfileDTO> & { id?: number };
    if (!payload || (!payload.id && !payload.userId)) {
      return NextResponse.json({ message: 'id or userId required' }, { status: 400 });
    }

    const apiBaseUrl = getApiBaseUrl();
    if (!apiBaseUrl) {
      return NextResponse.json({ message: 'API base URL not configured' }, { status: 500 });
    }

    let token = await getCachedApiJwt();
    if (!token) token = await generateApiJwt();
    if (!token) return NextResponse.json({ message: 'JWT generation failed' }, { status: 500 });

    const body = {
      ...payload,
      id: payload.id,
      tenantId: payload.tenantId || getTenantId(),
      updatedAt: new Date().toISOString(),
    } as any;

    const id = payload.id;
    const url = `${apiBaseUrl}/api/user-profiles/${id}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const text = await res.text();
    if (!res.ok) {
      let details: any = undefined; try { details = JSON.parse(text); } catch {}
      return NextResponse.json({ message: 'Update failed', details: details || text }, { status: res.status });
    }
    let json: any = undefined; try { json = JSON.parse(text); } catch { json = text; }
    return NextResponse.json(json, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: 'Internal server error', details: String(err) }, { status: 500 });
  }
}



