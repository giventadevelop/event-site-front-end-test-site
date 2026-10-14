import { expect, test, type Page, type Response } from 'playwright/test';

const HUB = 'www.adwiiseagent.ai';
const DEFAULT_SATELLITES = [
  'www.event-site-front-end-test-site.com',
  'www.mosc-temp.com',
  'www.keralacenter.org',
  'www.kcnj-temp.com',
  'www.mcefee-temp.com',
  'www.md-strikers.com',
  'www.rnb-productions.com',
  'www.giventa.com',
];
const LEGACY_HUB_HOSTS = [
  'www.event-site-manager.com',
  'www.kluvo.ai',
  'www.kluvo.io',
  'www.adwiiseagent.com',
  'www.adwiiseflow.com',
];
const LEGACY_API_HOSTS = /event-site-manager-(dev|prod)\.com|api\.giventa\.com/;

const requested = (process.env.SMOKE_SITES || '').split(',').map((s) => s.trim()).filter(Boolean);
const sites = requested.length ? requested : [HUB, ...DEFAULT_SATELLITES];

function trackProxyFailures(page: Page) {
  const failures: string[] = [];
  const legacyCalls: string[] = [];
  page.on('response', (res: Response) => {
    const url = res.url();
    if (LEGACY_API_HOSTS.test(url)) legacyCalls.push(url);
    if (url.includes('/api/proxy/') && (res.status() === 401 || res.status() >= 500)) {
      failures.push(`${res.status()} ${url}`);
    }
  });
  return { failures, legacyCalls };
}

async function firstEventId(page: Page, origin: string): Promise<number | null> {
  const res = await page.request.get(`${origin}/api/proxy/event-details?sort=startDate,desc&size=5`);
  if (!res.ok()) return null;
  const body = await res.json();
  const list = Array.isArray(body) ? body : body?.content ?? body?._embedded?.eventDetails ?? [];
  return list[0]?.id ?? null;
}

for (const host of sites) {
  const origin = `https://${host}`;
  const isHub = host === HUB;

  test.describe(host, () => {
    test('home page loads and proxies reach api.adwiiseagent.ai', async ({ page }) => {
      const tracked = trackProxyFailures(page);
      const res = await page.goto(origin, { waitUntil: 'load' });
      expect(res?.status(), 'home status').toBeLessThan(400);
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
      await expect(page).toHaveTitle(/.+/);
      expect(tracked.failures, 'proxy 401/5xx responses').toEqual([]);
      expect(tracked.legacyCalls, 'browser calls to legacy API hosts').toEqual([]);

      const settings = await page.request.get(`${origin}/api/proxy/tenant-settings`);
      expect(settings.status(), 'tenant-settings via proxy').toBe(200);
    });

    test('sign-in entry point', async ({ page }) => {
      const visited: string[] = [];
      page.on('framenavigated', (frame) => {
        if (frame === page.mainFrame()) visited.push(frame.url());
      });
      await page.goto(`${origin}/sign-in`);
      if (isHub) {
        await expect(page.locator('input[name="identifier"]')).toBeVisible();
      } else {
        await page.waitForURL((url) => url.hostname === HUB && url.pathname.startsWith('/sign-in'));
        await expect(page.locator('input[name="identifier"]')).toBeVisible();
        const hubSignIns = visited.filter((u) => new URL(u).hostname === HUB);
        const carriesOrigin = hubSignIns.some((u) => decodeURIComponent(decodeURIComponent(u)).includes(host));
        expect(carriesOrigin, `satellite origin carried to hub sign-in; visited: ${visited.join(' -> ')}`).toBe(true);
      }
    });

    test('event detail and checkout pages render', async ({ page }) => {
      const id = await firstEventId(page, origin);
      test.skip(id == null, 'tenant has no events');
      const tracked = trackProxyFailures(page);
      const detail = await page.goto(`${origin}/events/${id}`, { waitUntil: 'domcontentloaded' });
      expect(detail?.status(), 'event detail status').toBeLessThan(400);
      const checkout = await page.goto(`${origin}/events/${id}/checkout`, { waitUntil: 'domcontentloaded' });
      expect(checkout?.status(), 'checkout status').toBeLessThan(500);
      await page.waitForLoadState('networkidle').catch(() => undefined);
      expect(tracked.failures, 'proxy 401/5xx responses').toEqual([]);
    });
  });
}

test.describe('hub-only', () => {
  test.skip(requested.length > 0 && !requested.includes(HUB), 'hub not selected');

  test('onboarding request form renders (no submit)', async ({ page }) => {
    const res = await page.goto(`https://${HUB}/get-started`, { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBeLessThan(400);
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('form button[type="submit"]')).toBeVisible();
  });

  for (const legacy of LEGACY_HUB_HOSTS) {
    test(`legacy hub host ${legacy} redirects to adwiiseagent.ai`, async ({ page }) => {
      await page.goto(`https://${legacy}/`);
      expect(new URL(page.url()).hostname).toBe(HUB);
    });
  }
});
