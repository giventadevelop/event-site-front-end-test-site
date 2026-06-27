#!/usr/bin/env node
/**
 * Zoho SalesIQ REST API helpers (OAuth refresh + fetch).
 */

import { getSalesIqConfig, requireZohoCredentials } from './load-zoho-env.mjs';

let cachedAccessToken = null;
let cachedExpiresAt = 0;

export async function getSalesIqAccessToken() {
  if (cachedAccessToken && Date.now() < cachedExpiresAt - 30_000) {
    return cachedAccessToken;
  }

  const { clientId, clientSecret, refreshToken } = requireZohoCredentials();
  const { accountsBase } = getSalesIqConfig();

  const body = new URLSearchParams({
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(`${accountsBase}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error_description || data.error || `Token refresh failed (${response.status})`);
  }

  cachedAccessToken = data.access_token;
  cachedExpiresAt = Date.now() + (Number(data.expires_in) || 3600) * 1000;
  return cachedAccessToken;
}

/**
 * @param {string} pathWithQuery e.g. /api/v2/giventainc/articles?limit=99
 * @param {{ method?: string, headers?: Record<string, string>, body?: string }} [options]
 */
export async function salesIqFetch(pathWithQuery, options = {}) {
  const { apiBase } = getSalesIqConfig();
  const token = await getSalesIqAccessToken();
  const url = pathWithQuery.startsWith('http') ? pathWithQuery : `${apiBase}${pathWithQuery}`;

  const fetchOptions = {
    method: options.method || 'GET',
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      ...(options.headers || {}),
    },
  };
  if (options.body != null) {
    fetchOptions.body = options.body;
  }

  const response = await fetch(url, fetchOptions);

  let body = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }
  }

  return { response, body };
}

/**
 * @param {Record<string, string | number | undefined>} params
 */
export function buildArticlesListPath(screenName, params = {}) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      qs.set(key, String(value));
    }
  }
  const query = qs.toString();
  return `/api/v2/${screenName}/articles${query ? `?${query}` : ''}`;
}

/**
 * @param {string} screenName
 * @param {Record<string, string | number | undefined>} [filters]
 */
export async function listAllArticles(screenName, filters = {}) {
  const articles = [];
  let page = 1;
  const limit = 99;

  while (true) {
    const path = buildArticlesListPath(screenName, {
      ...filters,
      limit,
      page,
    });
    const { response, body } = await salesIqFetch(path);
    if (!response.ok) {
      const msg = body?.error?.message || JSON.stringify(body);
      throw new Error(`List articles failed (page ${page}, ${response.status}): ${msg}`);
    }

    const batch = Array.isArray(body?.data) ? body.data : [];
    articles.push(...batch);
    if (batch.length < limit) break;
    page += 1;
  }

  return articles;
}

export async function deleteArticle(screenName, articleId) {
  const path = `/api/v2/${screenName}/articles/${articleId}`;
  const { response, body } = await salesIqFetch(path, { method: 'DELETE' });
  if (!response.ok) {
    const msg = body?.error?.message || JSON.stringify(body);
    throw new Error(`Delete ${articleId} failed (${response.status}): ${msg}`);
  }
  return body;
}

/**
 * @param {string} screenName
 * @param {Record<string, unknown>} payload
 */
export async function createArticle(screenName, payload) {
  const path = `/api/v2/${screenName}/articles`;
  const { response, body } = await salesIqFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const msg = body?.error?.message || body?.message || JSON.stringify(body);
    throw new Error(`Create article failed (${response.status}): ${msg}`);
  }
  return body;
}

/**
 * @param {string} screenName
 */
export async function listDepartments(screenName) {
  const { response, body } = await salesIqFetch(`/api/v2/${screenName}/departments`);
  if (!response.ok) {
    const msg = body?.error?.message || JSON.stringify(body);
    throw new Error(`List departments failed (${response.status}): ${msg}`);
  }
  return Array.isArray(body?.data) ? body.data : [];
}

/**
 * @param {string} screenName
 */
export async function listArticleCategories(screenName) {
  const categories = [];
  let index = 0;
  const limit = 99;

  while (true) {
    const path = `/api/v2/${screenName}/articlecategories?index=${index}&limit=${limit}`;
    const { response, body } = await salesIqFetch(path);
    if (!response.ok) {
      const msg = body?.error?.message || JSON.stringify(body);
      throw new Error(`List article categories failed (${response.status}): ${msg}`);
    }
    const batch = Array.isArray(body?.data) ? body.data : [];
    categories.push(...batch);
    if (batch.length < limit) break;
    index += batch.length;
  }

  return categories;
}

/**
 * @param {Array<{ id: string, name?: string, display_name?: string }>} items
 * @param {string} name
 */
export function findIdByName(items, name) {
  const needle = String(name || '').trim().toLowerCase();
  if (!needle) return null;
  for (const item of items) {
    const candidates = [item.name, item.display_name].filter(Boolean).map((s) => String(s).trim().toLowerCase());
    if (candidates.some((c) => c === needle)) return String(item.id);
  }
  return null;
}

/**
 * @param {string} screenName
 * @param {Record<string, string | number | undefined>} [filters]
 */
export async function listAllFaqs(screenName, filters = {}) {
  const faqs = [];
  let page = 1;
  const limit = 99;

  while (true) {
    const qs = new URLSearchParams();
    qs.set('page', String(page));
    qs.set('limit', String(limit));
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        qs.set(key, String(value));
      }
    }
    const path = `/api/v3/${screenName}/faqs?${qs.toString()}`;
    const { response, body } = await salesIqFetch(path);
    if (!response.ok) {
      const msg = body?.error?.message || JSON.stringify(body);
      throw new Error(`List FAQs failed (page ${page}, ${response.status}): ${msg}`);
    }

    const batch = Array.isArray(body?.data) ? body.data : [];
    faqs.push(...batch);
    if (batch.length < limit) break;
    page += 1;
  }

  return faqs;
}

export async function deleteFaq(screenName, faqId) {
  const path = `/api/v3/${screenName}/faqs/${faqId}`;
  const { response, body } = await salesIqFetch(path, { method: 'DELETE' });
  if (!response.ok) {
    const msg = body?.error?.message || JSON.stringify(body);
    throw new Error(`Delete FAQ ${faqId} failed (${response.status}): ${msg}`);
  }
  return body;
}

/**
 * @param {string} screenName
 * @param {Record<string, unknown>} payload
 */
export async function createFaq(screenName, payload) {
  const path = `/api/v3/${screenName}/faqs`;
  const { response, body } = await salesIqFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const msg = body?.error?.message || body?.message || JSON.stringify(body);
    throw new Error(`Create FAQ failed (${response.status}): ${msg}`);
  }
  return body;
}

/**
 * @param {string} screenName
 */
export async function listFaqCategories(screenName) {
  const categories = [];
  let page = 1;
  const limit = 99;

  while (true) {
    const path = `/api/v3/${screenName}/faqcategories?sort_by=name&order=ascending&page=${page}&limit=${limit}`;
    const { response, body } = await salesIqFetch(path);
    if (!response.ok) {
      const msg = body?.error?.message || JSON.stringify(body);
      throw new Error(`List FAQ categories failed (page ${page}, ${response.status}): ${msg}`);
    }
    const batch = Array.isArray(body?.data) ? body.data : [];
    categories.push(...batch);
    if (batch.length < limit) break;
    page += 1;
  }

  return categories;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
