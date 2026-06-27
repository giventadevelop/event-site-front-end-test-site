import { NextRequest, NextResponse } from 'next/server';
import {
  fetchNextLiturgyDayFromToday,
  getLiturgyDaysApiPath,
  getLiturgyStrapiConfigured,
  mapLiturgyDayToReadings,
  type LiturgyApiResponse,
  type LiturgyReading,
} from '@/lib/strapi/liturgyDays';

export type { LiturgyReading, LiturgyApiResponse };

const LITURGY_DATA_SOURCE = process.env.LITURGY_DATA_SOURCE || 'external';
/** External SMCIM liturgy API – used when LITURGY_DATA_SOURCE !== 'strapi' */
const LITURGY_API_BASE = 'https://www.apiwebser.smcimprojects.com/api';

export async function GET(request: NextRequest) {
  const lng = request.nextUrl.searchParams.get('lng') ?? 'en';
  if (lng !== 'en' && lng !== 'ml') {
    return NextResponse.json(
      { error: 'Invalid language. Use lng=en or lng=ml' },
      { status: 400 }
    );
  }

  if (LITURGY_DATA_SOURCE === 'strapi') {
    return fetchFromStrapi(lng);
  }
  return fetchFromExternalApi(lng);
}

async function fetchFromStrapi(lng: string): Promise<NextResponse> {
  try {
    if (!getLiturgyStrapiConfigured()) {
      console.error('[Liturgy API] NEXT_PUBLIC_TENANT_ID and Strapi URL are required when using Strapi.');
      return NextResponse.json(
        {
          error:
            'Liturgy (Strapi) requires NEXT_PUBLIC_STRAPI_URL and NEXT_PUBLIC_TENANT_ID. Set them in .env.local and restart the server.',
        },
        { status: 503 }
      );
    }

    const strapiDay = await fetchNextLiturgyDayFromToday();

    if (!strapiDay) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Liturgy API] Strapi: no liturgy day found for date >= today');
      }
      const emptyBody: { message: LiturgyReading[]; _debug?: { source: string; url: string } } = { message: [] };
      if (process.env.NODE_ENV === 'development') {
        emptyBody._debug = { source: 'Strapi', url: getLiturgyDaysApiPath() };
      }
      return NextResponse.json(emptyBody, { status: 200 });
    }

    const message = mapLiturgyDayToReadings(strapiDay, lng as 'en' | 'ml');

    if (process.env.NODE_ENV === 'development') {
      console.log('[Liturgy API] Mapped', message.length, 'readings for', lng, 'date', strapiDay.date);
    }

    const responseBody: { message: LiturgyReading[]; liturgyDate: string; _debug?: { source: string; url: string } } = {
      message,
      liturgyDate: strapiDay.date,
    };
    if (process.env.NODE_ENV === 'development') {
      responseBody._debug = { source: 'Strapi', url: getLiturgyDaysApiPath() };
    }
    return NextResponse.json(responseBody);
  } catch (err) {
    console.error('[Liturgy API] Strapi fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch liturgy readings' },
      { status: 500 }
    );
  }
}

async function fetchFromExternalApi(lng: string): Promise<NextResponse> {
  try {
    const token =
      process.env.LITURGY_API_TOKEN ??
      process.env.AMPLIFY_LITURGY_API_TOKEN ??
      (process.env.NODE_ENV === 'development'
        ? 'dmdlMXBVWkNqcS95MkFDVmlEWExZQT09'
        : '');
    if (!token) {
      console.error('[Liturgy API] LITURGY_API_TOKEN (or AMPLIFY_LITURGY_API_TOKEN) is not set');
      return NextResponse.json(
        { error: 'Liturgy API is not configured' },
        { status: 503 }
      );
    }

    const params = new URLSearchParams({ __: token, lng });
    const url = `${LITURGY_API_BASE}/liturgy?${params.toString()}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('[Liturgy API] External request (token redacted):', `${LITURGY_API_BASE}/liturgy?__=***&lng=${lng}`);
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://www.syromalabarchurch.in/',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('[Liturgy API] Upstream error:', res.status, body);
      const message =
        res.status === 404 && body.includes('Access Denied')
          ? 'Liturgy API returned Access Denied. Check that LITURGY_API_TOKEN in .env.local matches the token from documentation (or request a new token from SMCIM).'
          : 'Liturgy service unavailable';
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const data: LiturgyApiResponse = await res.json();
    const body = { ...data } as LiturgyApiResponse & { _debug?: { source: string; url: string } };
    if (process.env.NODE_ENV === 'development') {
      body._debug = { source: 'External SMCIM API', url: `${LITURGY_API_BASE}/liturgy` };
    }
    return NextResponse.json(body);
  } catch (err) {
    console.error('[Liturgy API] External fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch liturgy readings' },
      { status: 500 }
    );
  }
}
