# Check Clerk Allowed Origins Configuration
# This script verifies if the Amplify domain is in Clerk's allowed origins

$clerkSecretKey = $env:CLERK_SECRET_KEY
if (-not $clerkSecretKey) {
    # Try to read from .env.production
    $envFile = Get-Content ".env.production" -ErrorAction SilentlyContinue
    foreach ($line in $envFile) {
        if ($line -match '^CLERK_SECRET_KEY=(.+)$') {
            $clerkSecretKey = $matches[1]
            break
        }
    }
}

if (-not $clerkSecretKey) {
    Write-Host "ERROR: CLERK_SECRET_KEY not found in environment or .env.production" -ForegroundColor Red
    exit 1
}

Write-Host "Checking Clerk allowed origins configuration..." -ForegroundColor Cyan
Write-Host ""

# Get instance configuration
$headers = @{
    "Authorization" = "Bearer $clerkSecretKey"
    "Content-Type" = "application/json"
}

try {
    # Get instance details
    $response = Invoke-RestMethod -Uri "https://api.clerk.com/v1/instance" -Headers $headers -Method Get

    Write-Host "Instance ID: $($response.id)" -ForegroundColor Green
    Write-Host "Environment: $($response.environment_type)" -ForegroundColor Green
    Write-Host ""

    Write-Host "Allowed Origins:" -ForegroundColor Yellow
    if ($response.allowed_origins -and $response.allowed_origins.Count -gt 0) {
        foreach ($origin in $response.allowed_origins) {
            Write-Host "  - $origin" -ForegroundColor White
        }
    } else {
        Write-Host "  No allowed origins configured (allows all)" -ForegroundColor Gray
    }

    Write-Host ""

    # Check if Amplify domain is in allowed origins
    $amplifyDomain = "https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com"
    if ($response.allowed_origins -contains $amplifyDomain) {
        Write-Host "✓ Amplify domain IS in allowed origins" -ForegroundColor Green
    } else {
        Write-Host "✗ Amplify domain NOT in allowed origins" -ForegroundColor Red
        Write-Host ""
        Write-Host "You need to add this domain to Clerk allowed origins:" -ForegroundColor Yellow
        Write-Host "  $amplifyDomain" -ForegroundColor White
        Write-Host ""
        Write-Host "Go to: https://dashboard.clerk.com/ → Settings → Allowed Origins" -ForegroundColor Cyan
    }

} catch {
    Write-Host "ERROR: Failed to fetch Clerk instance configuration" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red

    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host ""
        Write-Host "Authentication failed. Check your CLERK_SECRET_KEY" -ForegroundColor Yellow
    }
}
