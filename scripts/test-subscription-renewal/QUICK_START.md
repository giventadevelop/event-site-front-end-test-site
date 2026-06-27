# Quick Start Guide: Testing Subscription Renewal

## Your Test Subscription

Based on your database record:
- **Subscription ID**: `sub_1SeifsK5BrggeAHMBvg2XE93`
- **Tenant ID**: `tenant_demo_002`
- **Current Period End**: `2026-01-14`
- **Status**: `ACTIVE`

## Quick Test Commands

### 1. Set Environment Variables (Windows PowerShell)

```powershell
$env:STRIPE_SECRET_KEY="sk_test_..."
$env:DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
$env:NEXT_PUBLIC_API_BASE_URL="http://localhost:8080"
$env:API_JWT_USER="jwtadmin"
$env:API_JWT_PASS="jwtadmin"
$env:NEXT_PUBLIC_TENANT_ID="tenant_demo_002"
```

### 2. Install Dependencies

```bash
npm install --save-dev stripe pg
```

### 3. Run Full Test Suite (Git Bash or WSL)

```bash
bash scripts/test-subscription-renewal/run-full-test.sh \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93 \
  --tenant-id=tenant_demo_002 \
  --days-to-advance=30
```

### 4. Or Run Individual Steps

**Step 1: Expedite Renewal**
```bash
node scripts/test-subscription-renewal/expedite-stripe-renewal.js \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93 \
  --days-to-advance=30
```

**Step 2: Verify Database (after 10 seconds)**
```bash
node scripts/test-subscription-renewal/verify-database.js \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93 \
  --tenant-id=tenant_demo_002
```

**Step 3: Trigger Batch Job (if needed)**
```bash
node scripts/test-subscription-renewal/trigger-batch-job.js \
  --tenant-id=tenant_demo_002 \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93
```

**Step 4: Final Verification**
```bash
node scripts/test-subscription-renewal/verify-database.js \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93 \
  --tenant-id=tenant_demo_002
```

## Expected Results

After expediting renewal by 30 days:
- **Stripe**: Period end should advance from `2026-01-14` to `2026-02-13`
- **Database**: Should match Stripe after webhook/batch job processing
- **Status**: Should remain `ACTIVE`

## Troubleshooting

- **"No such subscription"**: Verify subscription ID in Stripe dashboard (test mode)
- **"Database not found"**: Check tenant_id matches your database record
- **"401 Unauthorized"**: Verify API_JWT_USER and API_JWT_PASS are correct
- **Period dates don't match**: Run batch job manually to sync

## Next Steps

1. Review detailed documentation: `scripts/test-subscription-renewal/README.md`
2. Check batch job logs in backend
3. Verify reconciliation status in database
4. Test multiple subscriptions if needed




