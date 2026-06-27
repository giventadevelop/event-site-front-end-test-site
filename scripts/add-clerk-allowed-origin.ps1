# Add Amplify domain to Clerk allowed origins
# This script adds the Amplify domain to the allowed origins list via Clerk API

$ErrorActionPreference = "Stop"

# Read Clerk secret key from .env.production
$envFile = Get-Content ".env.production" -ErrorAction Stop
$clerkSecretKey = ""
foreach ($line in $envFile) {
    if ($line -match '^CLERK_SECRET_KEY=(.+)$') {
        $clerkSecretKey = $matches[1].Trim()
        break
    }
}

if (-not $clerkSecretKey) {
    Write-Host "ERROR: CLERK_SECRET_KEY not found in .env.production" -ForegroundColor Red
    exit 1
}

$amplifyDomain = "https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Clerk Allowed Origins Management" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Get current configuration
$headers = @{
    "Authorization" = "Bearer $clerkSecretKey"
    "Content-Type" = "application/json"
}

Write-Host "Step 1: Fetching current allowed origins..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "https://api.clerk.com/v1/instance" -Headers $headers -Method Get -ErrorAction Stop

    Write-Host "Instance ID: $($response.id)" -ForegroundColor Green
    Write-Host "Environment: $($response.environment_type)" -ForegroundColor Green
    Write-Host ""

    Write-Host "Current allowed origins:" -ForegroundColor Yellow
    if ($response.allowed_origins -and $response.allowed_origins.Count -gt 0) {
        foreach ($origin in $response.allowed_origins) {
            Write-Host "  - $origin" -ForegroundColor White
        }
    } else {
        Write-Host "  (No restrictions - allows all origins)" -ForegroundColor Gray
    }

    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""

    # Check if Amplify domain is already present
    if ($response.allowed_origins -and $response.allowed_origins -contains $amplifyDomain) {
        Write-Host "✓ Amplify domain is ALREADY in allowed origins!" -ForegroundColor Green
        Write-Host ""
        Write-Host "The OAuth issue might be something else. Let me check further..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Checking if allowed_origins is empty (which allows all)..." -ForegroundColor Yellow

        if ($response.allowed_origins.Count -eq 0) {
            Write-Host "✓ Allowed origins is EMPTY - this allows ALL origins" -ForegroundColor Green
            Write-Host "  OAuth should work from any domain" -ForegroundColor Green
        } else {
            Write-Host "Allowed origins has $($response.allowed_origins.Count) entries" -ForegroundColor White
            Write-Host "Amplify domain is included, so OAuth should work" -ForegroundColor Green
        }

        exit 0
    }

    # Add Amplify domain to allowed origins
    Write-Host "Step 2: Adding Amplify domain to allowed origins..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Adding: $amplifyDomain" -ForegroundColor White
    Write-Host ""

    # Create new origins list
    $newOrigins = @()
    if ($response.allowed_origins) {
        $newOrigins = @($response.allowed_origins)
    }
    $newOrigins += $amplifyDomain

    # Update instance configuration
    $body = @{
        allowed_origins = $newOrigins
    } | ConvertTo-Json

    Write-Host "Sending update to Clerk API..." -ForegroundColor Yellow

    $updateResponse = Invoke-RestMethod -Uri "https://api.clerk.com/v1/instance" -Headers $headers -Method PATCH -Body $body -ErrorAction Stop

    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "✓ SUCCESS!" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "Updated allowed origins:" -ForegroundColor Yellow
    foreach ($origin in $updateResponse.allowed_origins) {
        if ($origin -eq $amplifyDomain) {
            Write-Host "  - $origin  ← NEW" -ForegroundColor Green
        } else {
            Write-Host "  - $origin" -ForegroundColor White
        }
    }

    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "1. Wait 1-2 minutes for Clerk to propagate changes" -ForegroundColor White
    Write-Host "2. Clear browser cookies or use incognito mode" -ForegroundColor White
    Write-Host "3. Try OAuth again at:" -ForegroundColor White
    Write-Host "   $amplifyDomain/sign-in" -ForegroundColor Cyan
    Write-Host "4. OAuth should now work successfully!" -ForegroundColor Green
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Red
    Write-Host "ERROR" -ForegroundColor Red
    Write-Host "============================================" -ForegroundColor Red
    Write-Host ""
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""

    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "HTTP Status Code: $statusCode" -ForegroundColor Red

        if ($statusCode -eq 401) {
            Write-Host ""
            Write-Host "Authentication failed. Please check:" -ForegroundColor Yellow
            Write-Host "1. CLERK_SECRET_KEY in .env.production is correct" -ForegroundColor White
            Write-Host "2. You are using the LIVE key (sk_live_...) not test key" -ForegroundColor White
        }
    }

    Write-Host ""
    exit 1
}
