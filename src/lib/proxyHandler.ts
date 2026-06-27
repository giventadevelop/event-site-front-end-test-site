import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedApiJwt, generateApiJwt } from '@/lib/api/jwt';
import { withTenantId } from '@/lib/withTenantId';
import { getRawBody } from '@/lib/getRawBody';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import { createLogger } from '@/lib/logger';

const logger = createLogger('PROXY-HANDLER');

interface ProxyHandlerOptions {
  injectTenantId?: boolean;
  allowedMethods?: string[];
  backendPath: string;
}

export function createProxyHandler({ injectTenantId = true, allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], backendPath }: ProxyHandlerOptions) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    // NOTE: CORS headers removed - Next.js API routes are same-origin by default
    // If CORS issues persist, re-enable these headers

    // CRITICAL: Log immediately when handler is invoked (before any processing)
    const timestamp = new Date().toISOString();
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Enhanced mobile detection: Include WhatsApp, mobile browsers, and CloudFront headers
    const userAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|WhatsApp|Mobile|CriOS|FxiOS/i.test(userAgent);
    const cloudfrontMobile = req.headers['cloudfront-is-mobile-viewer'] === 'true';
    const cloudfrontAndroid = req.headers['cloudfront-is-android-viewer'] === 'true';
    const cloudfrontIOS = req.headers['cloudfront-is-ios-viewer'] === 'true';
    const isMobile = userAgentMobile || cloudfrontMobile || cloudfrontAndroid || cloudfrontIOS;

    // Use robust logger that can't be stripped by Next.js
    logger.info('PROXY HANDLER INVOKED', {
      timestamp,
      backendPath,
      requestUrl: req.url,
      method: req.method,
      isMobile,
      userAgent: userAgent.substring(0, 150),
      queryParams: req.query,
    });

    // Also use console.log for backward compatibility
    console.log('[PROXY-HANDLER-START] ============================================');
    console.log('[PROXY-HANDLER-START] HANDLER INVOKED AT:', timestamp);
    console.log('[PROXY-HANDLER-START] Backend Path:', backendPath);
    console.log('[PROXY-HANDLER-START] Request URL:', req.url);
    console.log('[PROXY-HANDLER-START] Request Method:', req.method);
    console.log('[PROXY-HANDLER-START] Is Mobile:', isMobile);
    console.log('[PROXY-HANDLER-START] User-Agent:', userAgent.substring(0, 150));
    console.log('[PROXY-HANDLER-START] Query Params:', JSON.stringify(req.query));
    console.log('[PROXY-HANDLER-START] ============================================');

    try {
      const API_BASE_URL = getApiBaseUrl();
      console.log('[ProxyHandler] API_BASE_URL:', API_BASE_URL);
      if (!API_BASE_URL) {
        res.status(500).json({ error: 'API base URL not configured' });
        return;
      }
      const { method, query, body } = req;
      console.log('[ProxyHandler] Method:', method, 'Allowed:', allowedMethods);
      const tenantId = getTenantId();
      // Debug: Log incoming query and backendPath before replacement
      console.log('[ProxyHandler DEBUG] Incoming req.query:', query);
      console.log('[ProxyHandler DEBUG] Original backendPath:', backendPath);
      let path = backendPath;
      Object.entries(query).forEach(([key, value]) => {
        path = path.replace(`[${key}]`, encodeURIComponent(String(value)));
      });
      console.log('[ProxyHandler DEBUG] Path after param replacement:', path);
      const slug = query.slug;
      if (slug) {
        if (Array.isArray(slug)) {
          path += '/' + slug.map(encodeURIComponent).join('/');
        } else if (typeof slug === 'string') {
          path += '/' + encodeURIComponent(slug);
        }
      }
      // Remove slug from query before building query string
      const { slug: _omit, ...restQuery } = query;
      let qs;
      // Special case: only forward 'to' param for send-ticket-email endpoint
      if (path.includes('/send-ticket-email')) {
        qs = new URLSearchParams();
        if (query.to) qs.append('to', query.to as string);
      } else {
        qs = new URLSearchParams(req.query as Record<string, string>);
        qs.delete('slug');
        // Only append tenantId.equals for GET/POST list endpoints, not for PATCH/PUT/DELETE by ID
        const isListEndpoint =
          (method === 'GET' || method === 'POST') &&
          !/\/\d+(\/|$)/.test(path); // path does not end with /:id or /:id/...
        if (isListEndpoint && !Array.from(qs.keys()).includes('tenantId.equals')) {
          qs.append('tenantId.equals', tenantId);
        }
      }
      const queryString = qs.toString();
      const apiUrl = `${API_BASE_URL}${path}${queryString ? `?${queryString}` : ''}`;
      console.log('[ProxyHandler] Forwarding to backend URL:', apiUrl);
      if (!allowedMethods.includes(method!)) {
        res.setHeader('Allow', allowedMethods);
        res.status(405).end(`Method ${method} Not Allowed`);
        return;
      }
      // Log before entering the inner try block
      console.log('[ProxyHandler] About to enter try block');
      try {
        console.log('[ProxyHandler] Entered try block');
        let payload = body;
        console.log('[ProxyHandler] Preparing payload:', payload);
        // Determine Content-Type header
        let contentType = 'application/json';
        let extraHeaders: Record<string, string> = {};
        if (method === 'PATCH' && req.headers['content-type']) {
          contentType = req.headers['content-type'];
        }
        // Prepare headers
        console.log('[ProxyHandler] Preparing headers:', { 'Content-Type': contentType, ...extraHeaders });
        let bodyToSend: any = undefined;
        if (method === 'PATCH') {
          console.log('[PROXY] Received PATCH request:', {
            path,
            headers: req.headers,
            query: req.query
          });

          // Read the raw body as text, parse, inject tenantId, and re-stringify
          const rawBody = (await getRawBody(req)).toString('utf-8');
          console.log('[PROXY] Raw PATCH body:', rawBody);

          let json: any;
          try {
            json = JSON.parse(rawBody);
            console.log('[PROXY] Parsed PATCH body:', json);
          } catch (e) {
            console.error('[PROXY] Failed to parse PATCH body:', e);
            json = {};
          }

          if (injectTenantId) {
            const beforeTenant = { ...json };
            json = withTenantId(json);
            console.log('[PROXY] Injected tenantId:', {
              before: beforeTenant,
              after: json
            });
          }

          bodyToSend = JSON.stringify(json);
          // Use merge-patch+json if not explicitly set
          if (!req.headers['content-type']) {
            extraHeaders['Content-Type'] = 'application/merge-patch+json';
          }

          console.log('[PROXY OUTGOING] PATCH request details:', {
            method,
            path,
            apiUrl,
            headers: { ...req.headers, ...extraHeaders },
            payload: json
          });
        } else if (method === 'POST' || method === 'PUT') {
          // CRITICAL: Read raw body for POST/PUT when bodyParser is disabled
          // If req.body exists (bodyParser enabled), use it; otherwise read raw body
          if (body && typeof body === 'object' && Object.keys(body).length > 0) {
            // Body already parsed by Next.js bodyParser - use it directly
            console.log('[PROXY] Using req.body (already parsed by bodyParser):', body);
            payload = body;
          } else {
            // BodyParser is disabled or body is empty - read raw body
            console.log('[PROXY] Reading raw body for POST/PUT request (bodyParser disabled or empty)');
            try {
              // Add timeout to prevent hanging
              const rawBodyPromise = getRawBody(req);
              const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Raw body read timeout after 5 seconds')), 5000)
              );

              const rawBodyBuffer = await Promise.race([rawBodyPromise, timeoutPromise]) as Buffer;
              const rawBody = rawBodyBuffer.toString('utf-8');
              console.log('[PROXY] Raw POST/PUT body:', rawBody);

              if (rawBody) {
                try {
                  payload = JSON.parse(rawBody);
                  console.log('[PROXY] Parsed POST/PUT body:', payload);
                  console.log('[PROXY] Parsed POST/PUT body keys:', Object.keys(payload || {}));
                  // Special check for promotion email templates
                  if (path.includes('promotion-email-templates')) {
                    console.log('[PROXY DEBUG] Promotion email template - fromEmail in parsed body:', 'fromEmail' in (payload || {}));
                    console.log('[PROXY DEBUG] Promotion email template - fromEmail value:', payload?.fromEmail);
                  }
                } catch (e) {
                  console.error('[PROXY] Failed to parse POST/PUT body:', e);
                  throw new Error(`Invalid JSON in request body: ${e}`);
                }
              } else {
                // Fallback to req.body if raw body is empty
                console.log('[PROXY] Raw body is empty, using req.body as fallback');
                payload = body;
              }
            } catch (e) {
              console.error('[PROXY] Failed to read raw body:', e);
              // Fallback to req.body if raw body read fails
              console.log('[PROXY] Falling back to req.body due to raw body read error:', e);
              payload = body;
            }
          }
          // Apply tenantId injection for POST/PUT requests if needed
          if (injectTenantId && payload && typeof payload === 'object') {
            if (Array.isArray(payload)) {
              // For arrays, inject tenantId into each array item if they are objects
              payload = payload.map(item => {
                if (typeof item === 'object' && item !== null) {
                  // CRITICAL: Log before withTenantId to verify fromEmail exists
                  if (path.includes('promotion-email-templates')) {
                    console.log('[PROXY DEBUG] Before withTenantId - fromEmail:', item.fromEmail);
                    console.log('[PROXY DEBUG] Before withTenantId - keys:', Object.keys(item));
                  }
                  const itemWithTenantId = withTenantId(item);
                  // CRITICAL: Log after withTenantId to verify fromEmail is preserved
                  if (path.includes('promotion-email-templates')) {
                    console.log('[PROXY DEBUG] After withTenantId - fromEmail:', itemWithTenantId.fromEmail);
                    console.log('[PROXY DEBUG] After withTenantId - keys:', Object.keys(itemWithTenantId));
                  }
                  // Special logging for event-ticket-transaction-items
                  if (path.includes('event-ticket-transaction-items')) {
                    console.log('[PROXY DEBUG] Injected tenantId into transaction item:', {
                      before: { tenantId: item.tenantId },
                      after: { tenantId: itemWithTenantId.tenantId },
                      transactionId: item.transactionId,
                      ticketTypeId: item.ticketTypeId
                    });
                  }
                  return itemWithTenantId;
                }
                return item;
              });
            } else {
              // For single objects, inject tenantId normally
              // CRITICAL: Log before withTenantId to verify fromEmail exists
              if (path.includes('promotion-email-templates')) {
                console.log('[PROXY DEBUG] Before withTenantId - payload:', payload);
                console.log('[PROXY DEBUG] Before withTenantId - fromEmail:', payload.fromEmail);
                console.log('[PROXY DEBUG] Before withTenantId - keys:', Object.keys(payload || {}));
              }
              const beforeTenantId = payload.tenantId;
              payload = withTenantId(payload);
              // CRITICAL: Log after withTenantId to verify fromEmail is preserved
              if (path.includes('promotion-email-templates')) {
                console.log('[PROXY DEBUG] After withTenantId - payload:', payload);
                console.log('[PROXY DEBUG] After withTenantId - fromEmail:', payload.fromEmail);
                console.log('[PROXY DEBUG] After withTenantId - keys:', Object.keys(payload || {}));
              }
              // Special logging for event-ticket-transaction-items
              if (path.includes('event-ticket-transaction-items')) {
                console.log('[PROXY DEBUG] Injected tenantId into transaction item (single):', {
                  before: { tenantId: beforeTenantId },
                  after: { tenantId: payload.tenantId },
                  transactionId: payload.transactionId,
                  ticketTypeId: payload.ticketTypeId,
                  method
                });
              }
            }
          }

          // Special debugging for promotion emails
          if (path.includes('send-promotion-emails')) {
            console.log('[PROXY DEBUG] Promotion email request - payload after tenantId injection:', payload);
            console.log('[PROXY DEBUG] Promotion email request - payload.isTestEmail:', payload?.isTestEmail);
            console.log('[PROXY DEBUG] Promotion email request - typeof payload.isTestEmail:', typeof payload?.isTestEmail);
            console.log('[PROXY DEBUG] Promotion email request - JSON.stringify(payload):', JSON.stringify(payload));
          }

          // Special debugging for promotion email templates
          if (path.includes('promotion-email-templates') && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
            console.log('[PROXY DEBUG] Promotion email template - payload after tenantId injection:', payload);
            console.log('[PROXY DEBUG] Promotion email template - payload.fromEmail:', payload?.fromEmail);
            console.log('[PROXY DEBUG] Promotion email template - typeof payload.fromEmail:', typeof payload?.fromEmail);
            console.log('[PROXY DEBUG] Promotion email template - payload keys:', Object.keys(payload || {}));
            console.log('[PROXY DEBUG] Promotion email template - has fromEmail:', 'fromEmail' in (payload || {}));
          }

          // CRITICAL: Validate tenantId is present for event-ticket-transaction-items POST/PUT
          if (path.includes('event-ticket-transaction-items')) {
            if (Array.isArray(payload)) {
              const missingTenantId = payload.find((item: any) => !item.tenantId);
              if (missingTenantId) {
                console.error('[PROXY ERROR] Missing tenantId in transaction item array:', {
                  method,
                  path,
                  missingItem: missingTenantId,
                  allItems: payload.map((item: any) => ({ tenantId: item.tenantId, transactionId: item.transactionId }))
                });
                throw new Error(`Missing tenantId in transaction item: ${JSON.stringify(missingTenantId)}`);
              }
            } else if (!payload.tenantId) {
              console.error('[PROXY ERROR] Missing tenantId in transaction item:', {
                method,
                path,
                payload
              });
              throw new Error(`Missing tenantId in transaction item: ${JSON.stringify(payload)}`);
            }
          }

          // Log payload before sending for POST/PUT
          console.log('[PROXY OUTGOING] POST/PUT request details:', {
            method,
            path,
            apiUrl,
            headers: { 'Content-Type': contentType, ...extraHeaders },
            payload: payload
          });

          // CRITICAL: Verify fromEmail is in payload before stringifying
          if (path.includes('promotion-email-templates') && (method === 'POST' || method === 'PUT')) {
            console.log('[PROXY CRITICAL] Final payload before stringify - fromEmail:', payload?.fromEmail);
            console.log('[PROXY CRITICAL] Final payload before stringify - keys:', Object.keys(payload || {}));
            console.log('[PROXY CRITICAL] Final payload before stringify - JSON:', JSON.stringify(payload));
            if (!payload?.fromEmail) {
              console.error('[PROXY ERROR] fromEmail is MISSING from payload before sending to backend!');
              console.error('[PROXY ERROR] Payload:', payload);
            }
          }

          // CRITICAL: For promotion email templates, ensure fromEmail is sent in both camelCase and snake_case
          // Some Spring Boot configurations might expect snake_case
          if (path.includes('promotion-email-templates') && (method === 'POST' || method === 'PUT') && payload?.fromEmail) {
            // Ensure both formats are present for compatibility
            const enhancedPayload = {
              ...payload,
              fromEmail: payload.fromEmail, // camelCase (standard)
              from_email: payload.fromEmail, // snake_case (for Spring Boot snake_case naming strategy)
            };
            bodyToSend = JSON.stringify(enhancedPayload);
            console.log('[PROXY CRITICAL] Enhanced payload with both fromEmail and from_email:', {
              fromEmail: enhancedPayload.fromEmail,
              from_email: enhancedPayload.from_email,
            });
          } else {
            bodyToSend = JSON.stringify(payload);
          }

          // CRITICAL: Verify fromEmail is in stringified body
          if (path.includes('promotion-email-templates') && (method === 'POST' || method === 'PUT')) {
            const stringifiedBody = bodyToSend;
            const parsedCheck = JSON.parse(stringifiedBody);
            console.log('[PROXY CRITICAL] After stringify - fromEmail in parsed check:', parsedCheck?.fromEmail);
            console.log('[PROXY CRITICAL] After stringify - from_email in parsed check:', parsedCheck?.from_email);
            if (!parsedCheck?.fromEmail && !parsedCheck?.from_email) {
              console.error('[PROXY ERROR] Both fromEmail and from_email are MISSING from stringified body!');
              console.error('[PROXY ERROR] Stringified body:', stringifiedBody);
            }
          }
        }
        // Log the outgoing payload for all non-GET/DELETE
        if (method !== 'GET' && method !== 'DELETE') {
          try {
            const parsed = JSON.parse(bodyToSend);
            console.log('[PROXY OUTGOING] apiUrl:', apiUrl, 'method:', method, 'headers:', { 'Content-Type': contentType, ...extraHeaders }, 'payload:', parsed, 'typeof payload:', typeof bodyToSend);
          } catch {
            console.log('[PROXY OUTGOING] apiUrl:', apiUrl, 'method:', method, 'headers:', { 'Content-Type': contentType, ...extraHeaders }, 'payload:', bodyToSend, 'typeof payload:', typeof bodyToSend);
          }
        }
        // Before making the backend request, add debug logging for /by-user endpoints
        if (apiUrl.includes('/by-user')) {
          console.log('[PROXY DEBUG] Outgoing headers for by-user:', {
            method,
            path,
            apiUrl,
            headers: { ...req.headers, ...extraHeaders },
            payload: payload
          });
          if (req.headers && typeof req.headers.Authorization === 'string') {
            const jwt = req.headers.Authorization.split(' ')[1];
            try {
              const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString());
              console.log('[PROXY DEBUG] JWT payload:', payload);
            } catch (e) {
              console.log('[PROXY DEBUG] Could not decode JWT:', e);
            }
          } else {
            console.log('[PROXY DEBUG] No Authorization header present for by-user endpoint');
          }
        }
        console.log('[ProxyHandler] About to call fetchWithJwtRetry');

        // Special logging for promotion emails - log exactly what we're sending to backend
        if (path.includes('send-promotion-emails') && bodyToSend) {
          console.log('[PROXY FINAL] About to send to backend API:', {
            url: apiUrl,
            method: method,
            headers: { 'Content-Type': contentType, ...extraHeaders },
            body: bodyToSend
          });
          try {
            const parsedBody = JSON.parse(bodyToSend);
            console.log('[PROXY FINAL] Parsed body being sent to backend:', parsedBody);
            console.log('[PROXY FINAL] isTestEmail in final payload:', parsedBody.isTestEmail);
          } catch (e) {
            console.log('[PROXY FINAL] Could not parse body:', e);
          }
        }

        // CRITICAL: Special logging for promotion email templates - verify fromEmail is in final body
        if (path.includes('promotion-email-templates') && bodyToSend && (method === 'POST' || method === 'PUT')) {
          console.log('[PROXY FINAL] About to send promotion email template to backend API:', {
            url: apiUrl,
            method: method,
            headers: { 'Content-Type': contentType, ...extraHeaders },
            bodyLength: bodyToSend.length
          });
          try {
            const parsedBody = JSON.parse(bodyToSend);
            console.log('[PROXY FINAL] Parsed body being sent to backend:', parsedBody);
            console.log('[PROXY FINAL] fromEmail in final payload:', parsedBody.fromEmail);
            console.log('[PROXY FINAL] fromEmail type:', typeof parsedBody.fromEmail);
            console.log('[PROXY FINAL] All keys in final payload:', Object.keys(parsedBody));
            if (!parsedBody.fromEmail) {
              console.error('[PROXY FINAL ERROR] fromEmail is MISSING from final payload being sent to backend!');
              console.error('[PROXY FINAL ERROR] Full payload:', JSON.stringify(parsedBody, null, 2));
            }
            // Also log the raw body string to see exact JSON
            console.log('[PROXY FINAL] Raw JSON body string:', bodyToSend.substring(0, 500)); // First 500 chars
          } catch (e) {
            console.error('[PROXY FINAL] Could not parse body:', e);
            console.error('[PROXY FINAL] Raw body:', bodyToSend);
          }
        }

        const apiRes = await fetchWithJwtRetry(apiUrl, {
          method,
          headers: { 'Content-Type': contentType, ...extraHeaders },
          ...(bodyToSend ? { body: bodyToSend } : {}),
        }, `proxy-${backendPath}-${method}`);
        console.log('[ProxyHandler] fetchWithJwtRetry returned:', apiRes.status);

        // Forward x-total-count header for GET requests
        if (method === 'GET') {
          const totalCount = apiRes.headers.get('x-total-count');
          if (totalCount) {
            res.setHeader('x-total-count', totalCount);
          }

          // Handle empty responses (e.g., 404 with no body)
          const responseContentType = apiRes.headers.get('content-type') || '';
          const text = await apiRes.text();

          // If response is empty or not JSON, return appropriate error
          if (!text || text.trim() === '') {
            if (apiRes.status === 404) {
              res.status(404).json({ error: 'Resource not found' });
            } else {
              res.status(apiRes.status).json({ error: 'Empty response from backend' });
            }
            return;
          }

          // Try to parse as JSON, fallback to text if not JSON
          try {
            const data = JSON.parse(text);
            res.status(apiRes.status).json(data);
          } catch (parseError) {
            // If not JSON, return as text with appropriate content type
            res.status(apiRes.status).setHeader('Content-Type', responseContentType || 'text/plain');
            res.send(text);
          }
          return;
        }
        const data = await apiRes.text();
        res.status(apiRes.status).send(data);
      } catch (err) {
        const errorObj = err as Error;
        console.error('[ProxyHandler ERROR]', err, errorObj.stack);
        res.status(500).json({ error: 'Internal server error', details: String(err) });
      }
    } catch (err) {
      const errorObj = err as Error;
      console.error('[ProxyHandler OUTER ERROR]', err, errorObj.stack);
      res.status(500).json({ error: 'Internal server error', details: String(err) });
    }
  }
}

function buildQueryString(query: Record<string, any>) {
  const params = new URLSearchParams();
  for (const key in query) {
    const value = query[key];
    if (Array.isArray(value)) {
      value.forEach(v => params.append(key, v));
    } else if (typeof value !== 'undefined') {
      params.append(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function fetchWithJwtRetry(apiUrl: string, options: any = {}, debugLabel = '') {
  console.log('[fetchWithJwtRetry] Called with URL:', apiUrl);
  let token = await getCachedApiJwt();
  const tenantId = getTenantId();
  console.log('[fetchWithJwtRetry] Using JWT:', token);
  console.log('[fetchWithJwtRetry] Using Tenant ID:', tenantId);
  
  // Add timeout to fetch calls (30 seconds default, can be overridden in options)
  const timeoutMs = options.timeout || 30000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    let response = await fetch(apiUrl, {
      ...options,
      signal: controller.signal,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'X-Tenant-ID': tenantId, // CRITICAL: Backend TenantContextFilter expects this header
      },
    });
    clearTimeout(timeoutId);
    console.log('[fetchWithJwtRetry] Response status:', response.status);
    if (response.status === 401) {
      token = await generateApiJwt();
      console.log('[fetchWithJwtRetry] Retrying with new JWT:', token);
      // Create new controller for retry
      const retryController = new AbortController();
      const retryTimeoutId = setTimeout(() => retryController.abort(), timeoutMs);
      try {
        response = await fetch(apiUrl, {
          ...options,
          signal: retryController.signal,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
            'X-Tenant-ID': tenantId, // CRITICAL: Backend TenantContextFilter expects this header
          },
        });
        clearTimeout(retryTimeoutId);
        console.log('[fetchWithJwtRetry] Response status (after retry):', response.status);
      } catch (retryError: any) {
        clearTimeout(retryTimeoutId);
        if (retryError.name === 'AbortError') {
          throw new Error(`Request to ${apiUrl} timed out after ${timeoutMs}ms`);
        }
        throw retryError;
      }
    }
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request to ${apiUrl} timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}