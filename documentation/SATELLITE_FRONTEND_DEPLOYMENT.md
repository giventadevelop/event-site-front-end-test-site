# Satellite frontend deployment (this repo)

This repository is the **reference production satellite** for the Event Site Manager platform.

| Item | Value |
|------|--------|
| Production URL | `https://www.mosc-temp.com` |
| Amplify app | `d1jo61890p2myt` (us-east-2, Web Compute) |
| Branch | `release/v1.0.0` |
| Route 53 zone | `Z07785143III9YRMM9SJG` |
| Primary auth | `https://www.event-site-manager.com` |
| Backend API | `https://event-site-manager-prod.com` (typical prod) |
| Clerk satellite | `www.mosc-temp.com` (prod instance, **Verified**) |
| Clerk FAPI CNAME | `clerk.www.mosc-temp.com` → `frontend-api.clerk.services` |

## Canonical runbook

Use the shared guide when adding **new** satellite sites (copy this pattern):

`F:\project_workspace\application-deployments\documentation\aws-infrastructure\satellite-frontend-deployment-guide.html`

- **Inventory (prod & dev)** — `#inventory`
- **Clerk DNS (avoid Unverified)** — `#clerk-dns-verification`
- **Automation scripts** — `#automation` (local `_private/scripts/` in application-deployments)

Second reference deployment: `www.event-site-front-end-test-site.com` (Amplify `d1502cffqchuun`, production branch `release/v1.0.0`; `main` is DEVELOPMENT).

## Amplify env vars

See [AWS_AMPLIFY_ENV_VARS.md](./AWS_AMPLIFY_ENV_VARS.md) for bulk CLI upload. Production defaults:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/set-amplify-env-vars.ps1 -EnvFile .env.production -BranchName release/v1.0.0 -AppId d1jo61890p2myt -Region us-east-2

aws amplify start-job --app-id d1jo61890p2myt --branch-name release/v1.0.0 --job-type RELEASE --region us-east-2
```

## Clerk v7

Satellite auth requires URL handshake (`clerk.redirectToSignIn()` / `redirectToSignUp()`). Do not hand-roll `?redirect_url=` redirects. Primary app must remain deployed for sign-in and `/auth/signout-redirect`.
