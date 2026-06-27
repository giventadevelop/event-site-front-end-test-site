# Satellite frontend deployment (this repo)

This repository is deployed as a **Clerk satellite** frontend at:

| Item | Value |
|------|--------|
| Production URL | `https://www.event-site-front-end-test-site.com` |
| Amplify app | `d1502cffqchuun` (us-east-2, Web Compute) |
| Branch | `main` |
| Primary auth | `https://www.event-site-manager.com` |
| Backend API | `https://event-site-manager-prod.com` |
| Tenant | `tenant_demo_002` |
| Clerk satellite | `www.event-site-front-end-test-site.com` (prod instance, **Verified**) |

## Canonical runbook

Full step-by-step workflow (Route 53, Amplify, Clerk DNS `clerk.www` → `frontend-api.clerk.services`, dev vs prod paths, troubleshooting) lives in the **application-deployments** repo:

`documentation/aws-infrastructure/satellite-frontend-deployment-guide.html`

Key sections:

- **Deployment inventory** — `#inventory` (mosc-temp vs this site vs new satellites)
- **Clerk DNS verification** — `#clerk-dns-verification` (avoid 0/1 Unverified in Dashboard)
- **Amplify env vars** — `#phase6` and `scripts/set-amplify-env-vars.ps1`

## Local operations

```powershell
# Bulk push .env.production to Amplify (from repo root)
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/set-amplify-env-vars.ps1 -EnvFile .env.production -BranchName main -AppId d1502cffqchuun -Region us-east-2

# Trigger production redeploy
aws amplify start-job --app-id d1502cffqchuun --branch-name main --job-type RELEASE --region us-east-2
```

## Code conventions

Satellite detection uses **environment variables** (`NEXT_PUBLIC_CLERK_IS_SATELLITE`, `NEXT_PUBLIC_CLERK_DOMAIN`, `NEXT_PUBLIC_PRIMARY_DOMAIN`) — not hardcoded hostnames. Sign-in uses `clerk.redirectToSignIn()` (Clerk v7 handshake). See `.cursor/rules/clerk_auth_satellite_v7_handshake.mdc` in the primary app repo.
