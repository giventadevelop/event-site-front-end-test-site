# Clerk Backend Authentication Deployment Guide

## Overview
This guide covers deployment configuration for the Clerk backend authentication system.

---

## Environment Variables for Production

### Required Variables

```bash
# Clerk Backend Integration (REQUIRED)
CLERK_SECRET_KEY=sk_live_***_production_clerk_secret_key

# Clerk API (OPTIONAL - defaults to https://api.clerk.com)
CLERK_BACKEND_API_URL=https://api.clerk.com

# Backend API (REQUIRED)
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.com

# Tenant Configuration (REQUIRED)
NEXT_PUBLIC_TENANT_ID=your_production_tenant_id

# Application URL (REQUIRED)
NEXT_PUBLIC_APP_URL=https://your-app-domain.com

# Social Authentication (OPTIONAL)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
```

---

## AWS Amplify Deployment

### 1. Environment Variables Configuration

In AWS Amplify Console → App Settings → Environment Variables, add:

```bash
# Clerk Configuration
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...

# Backend API
NEXT_PUBLIC_API_BASE_URL=https://api.yourapp.com

# Tenant Configuration
NEXT_PUBLIC_TENANT_ID=tenant_production_001

# Application URL
NEXT_PUBLIC_APP_URL=https://yourapp.com

# Social Auth (if enabled)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
NEXT_PUBLIC_FACEBOOK_APP_ID=...
NEXT_PUBLIC_GITHUB_CLIENT_ID=...
```

### 2. Build Settings

`amplify.yml`:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### 3. Next.js Configuration

Ensure `next.config.mjs` includes all required environment variables:

```javascript
env: {
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_TENANT_ID: process.env.NEXT_PUBLIC_TENANT_ID,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  NEXT_PUBLIC_FACEBOOK_APP_ID: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
  NEXT_PUBLIC_GITHUB_CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
}
```

---

## Vercel Deployment

### 1. Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

Add the same variables as AWS Amplify configuration.

### 2. Build Configuration

Vercel automatically detects Next.js. No additional configuration needed.

### 3. Domain Configuration

- Set up custom domain
- Update `NEXT_PUBLIC_APP_URL` to match production domain
- Configure SSL/TLS certificates (automatic with Vercel)

---

## Docker Deployment

### 1. Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_TENANT_ID
ARG NEXT_PUBLIC_APP_URL

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_TENANT_ID=$NEXT_PUBLIC_TENANT_ID
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
# Default Next.js output (no `output: 'standalone'` in next.config — matches AWS Amplify SSR artifact layout).
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["npm", "start"]
```

### 2. Docker Compose

```yaml
version: '3.8'

services:
  nextjs-app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL}
        NEXT_PUBLIC_TENANT_ID: ${NEXT_PUBLIC_TENANT_ID}
        NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL}
    ports:
      - "3000:3000"
    environment:
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      - NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
      - NEXT_PUBLIC_TENANT_ID=${NEXT_PUBLIC_TENANT_ID}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    env_file:
      - .env.production
    restart: unless-stopped
```

### 3. Environment File

`.env.production`:
```bash
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_API_BASE_URL=https://api.yourapp.com
NEXT_PUBLIC_TENANT_ID=tenant_production_001
NEXT_PUBLIC_APP_URL=https://yourapp.com
```

---

## Security Checklist

### Pre-Deployment:
- [ ] All API keys are in environment variables (not hardcoded)
- [ ] `.env.local` is in `.gitignore`
- [ ] CLERK_SECRET_KEY is never exposed to client
- [ ] HTTPS is enabled for production
- [ ] CORS is configured correctly on backend
- [ ] Rate limiting is enabled on backend APIs

### OAuth Configuration:
- [ ] Google OAuth redirect URIs configured
- [ ] Facebook OAuth app domains configured
- [ ] GitHub OAuth callback URLs configured
- [ ] Social provider credentials are production keys

### Backend Configuration:
- [ ] Backend accepts tokens from Clerk
- [ ] Backend validates JWT signatures
- [ ] Backend implements token refresh endpoint
- [ ] Backend enforces tenant isolation

---

## Post-Deployment Verification

### 1. Test Authentication Flows

```bash
# Test sign-in
curl -X POST https://yourapp.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'

# Test token refresh
curl -X POST https://yourapp.com/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"refresh_token_here"}'

# Test protected endpoint
curl -X GET https://yourapp.com/api/auth/me \
  -H "Authorization: Bearer access_token_here"
```

### 2. Verify Social Login

- [ ] Test Google sign-in on production domain
- [ ] Test Facebook sign-in on production domain
- [ ] Test GitHub sign-in on production domain
- [ ] Verify redirect URIs work correctly

### 3. Monitor Logs

```bash
# AWS Amplify
aws amplify get-app --app-id your-app-id

# Vercel
vercel logs

# Docker
docker logs container-name
```

---

## Rollback Plan

### Quick Rollback Steps:

1. **Revert to Previous Deployment**
   - AWS Amplify: Use console to rollback to previous version
   - Vercel: Redeploy previous successful deployment
   - Docker: `docker-compose down && docker-compose up -d` with previous image

2. **Switch Back to Client-Side Clerk** (if needed)
   - Update sign-in/sign-up pages to use old routes
   - Comment out new AuthProvider
   - Restore old Clerk components

---

## Performance Optimization

### 1. Enable Caching

```javascript
// next.config.mjs
const nextConfig = {
  // ... other config

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-cache, no-store, must-revalidate' },
        ],
      },
    ];
  },
};
```

### 2. Enable Compression

Ensure your deployment platform has compression enabled (gzip/brotli).

### 3. CDN Configuration

- Serve static assets from CDN
- Cache public resources
- Don't cache authenticated API responses

---

## Monitoring & Alerts

### Metrics to Monitor:

1. **Authentication Success Rate**
   - Track successful vs failed sign-ins
   - Monitor token refresh success rate
   - Alert on unusual failure patterns

2. **API Performance**
   - Monitor authentication endpoint response times
   - Track token validation latency
   - Alert on slow responses (>500ms)

3. **Error Rates**
   - Monitor 401 error rates
   - Track token expiration frequency
   - Alert on spike in errors

### Tools:

- AWS CloudWatch (for Amplify)
- Vercel Analytics (for Vercel)
- Custom logging to monitoring service (Datadog, New Relic, etc.)

---

## Troubleshooting

### Common Issues:

#### 1. "Token verification failed"
- Check CLERK_SECRET_KEY matches production key
- Verify backend can reach Clerk API
- Check token format and signature

#### 2. "Social login not working"
- Verify redirect URIs in provider console
- Check client IDs match production credentials
- Ensure HTTPS is enabled

#### 3. "Token refresh failing"
- Check refresh token endpoint implementation
- Verify token storage is working
- Monitor for clock skew issues

#### 4. "Multi-tenant isolation broken"
- Verify tenant ID injection in API client
- Check backend enforces tenant filtering
- Validate all queries include tenant criteria

---

## Deployment Checklist

### Pre-Deployment:
- [ ] All environment variables configured
- [ ] Backend APIs deployed and accessible
- [ ] SSL/TLS certificates configured
- [ ] DNS records updated
- [ ] OAuth providers configured

### During Deployment:
- [ ] Build succeeds without errors
- [ ] All tests pass
- [ ] No security warnings
- [ ] Bundle size is acceptable

### Post-Deployment:
- [ ] Sign-in flow works
- [ ] Sign-up flow works
- [ ] Social login works
- [ ] Token refresh works
- [ ] Protected routes work
- [ ] Multi-tenant isolation works
- [ ] Performance is acceptable
- [ ] Monitoring is active

---

## Support Contacts

- **Clerk Support**: https://clerk.com/support
- **Backend Team**: backend-team@yourapp.com
- **DevOps**: devops@yourapp.com

---

**Last Updated:** October 14, 2025


