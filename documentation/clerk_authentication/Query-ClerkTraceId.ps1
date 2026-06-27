#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Query Clerk API for trace ID details
.DESCRIPTION
    Retrieves detailed error information for a specific Clerk trace ID
.PARAMETER TraceId
    The Clerk trace ID to look up
.PARAMETER SecretKey
    Your Clerk secret key (sk_live_... or sk_test_...)
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$TraceId,

    [Parameter(Mandatory=$false)]
    [string]$SecretKey
)

# Script metadata
$ScriptVersion = "1.0.0"
$ScriptName = "Clerk Trace ID Query Script"

# Color functions
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host "=" * 80 -ForegroundColor Cyan
    Write-Host " $Text" -ForegroundColor Cyan
    Write-Host "=" * 80 -ForegroundColor Cyan
    Write-Host ""
}

function Write-Info {
    param([string]$Text)
    Write-Host "[INFO] " -ForegroundColor Green -NoNewline
    Write-Host $Text
}

function Write-Warning {
    param([string]$Text)
    Write-Host "[WARN] " -ForegroundColor Yellow -NoNewline
    Write-Host $Text
}

function Write-ErrorMsg {
    param([string]$Text)
    Write-Host "[ERROR] " -ForegroundColor Red -NoNewline
    Write-Host $Text
}

# Display header
Write-Header "$ScriptName v$ScriptVersion"

# Get trace ID if not provided
if (-not $TraceId) {
    Write-Info "Trace ID not provided as parameter"
    Write-Host ""
    $TraceId = Read-Host "Enter Clerk trace ID"
}

# Validate trace ID
if ([string]::IsNullOrWhiteSpace($TraceId)) {
    Write-ErrorMsg "Trace ID is required"
    exit 1
}

Write-Info "Trace ID: $TraceId"

# Get secret key if not provided
if (-not $SecretKey) {
    Write-Info "Secret key not provided as parameter"

    # Try to read from .env.production
    $envFile = Join-Path $PSScriptRoot "../../.env.production"

    if (Test-Path $envFile) {
        Write-Info "Reading secret key from .env.production"
        $envContent = Get-Content $envFile -Raw

        if ($envContent -match 'CLERK_SECRET_KEY=([^\r\n]+)') {
            $SecretKey = $matches[1].Trim()
            Write-Info "Secret key found in .env.production"
        } else {
            Write-Warning "Could not read valid secret key from environment file"
        }
    } else {
        Write-Warning "Environment file not found: $envFile"
    }
}

# If still no secret key, prompt user
if (-not $SecretKey) {
    Write-Host ""
    Write-Header " Clerk Secret Key Required"
    Write-Host ""
    Write-Host "Your Clerk secret key is needed to query trace ID details."
    Write-Host "The key should start with 'sk_live_' for production or 'sk_test_' for development."
    Write-Host ""

    $maxAttempts = 3
    $attempt = 0

    while ($attempt -lt $maxAttempts -and -not $SecretKey) {
        $attempt++
        $SecretKey = Read-Host "Enter Clerk secret key (sk_live_... or sk_test_...)" -AsSecureString
        $SecretKey = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecretKey)
        )

        if ($SecretKey -match '^sk_(live|test)_[A-Za-z0-9]+$') {
            Write-Info "Valid secret key format detected"
            break
        } else {
            Write-ErrorMsg "Invalid secret key format. Must start with 'sk_live_' or 'sk_test_'"
            Write-Warning "Attempts remaining: $($maxAttempts - $attempt)"
            $SecretKey = $null
        }
    }

    if (-not $SecretKey) {
        Write-ErrorMsg "Maximum attempts reached. Exiting."
        exit 1
    }
}

# Validate secret key format
if ($SecretKey -notmatch '^sk_(live|test)_[A-Za-z0-9]+$') {
    Write-ErrorMsg "Invalid secret key format. Must start with 'sk_live_' or 'sk_test_'"
    exit 1
}

$environment = if ($SecretKey -match '^sk_live_') { "PRODUCTION" } else { "DEVELOPMENT" }
Write-Info "Environment: $environment"

# Query Clerk API for sessions/events
Write-Host ""
Write-Header " Querying Clerk API"

$headers = @{
    "Authorization" = "Bearer $SecretKey"
    "Content-Type" = "application/json"
}

# Try to fetch recent sessions/events
$apiUrl = "https://api.clerk.com/v1/sessions"

try {
    Write-Info "Fetching recent sessions from Clerk API..."

    $response = Invoke-RestMethod -Uri $apiUrl -Method GET -Headers $headers -ErrorAction Stop

    Write-Info "Successfully retrieved sessions data"

    # Search for trace ID in session data
    $matchingSession = $null

    if ($response.data) {
        foreach ($session in $response.data) {
            # Check if trace ID appears in any session data
            $sessionJson = $session | ConvertTo-Json -Depth 10 -Compress

            if ($sessionJson -match $TraceId) {
                $matchingSession = $session
                break
            }
        }
    }

    if ($matchingSession) {
        Write-Host ""
        Write-ColorOutput Green "Found session matching trace ID!"
        Write-Host ""

        $matchingSession | ConvertTo-Json -Depth 10 | Write-Host
    } else {
        Write-Warning "Trace ID not found in recent sessions"
        Write-Host ""
        Write-Info "Recent sessions:"
        $response.data | Select-Object -First 5 | ForEach-Object {
            Write-Host "  - Session ID: $($_.id)"
            Write-Host "    User ID: $($_.user_id)"
            Write-Host "    Status: $($_.status)"
            Write-Host "    Created: $($_.created_at)"
            Write-Host ""
        }
    }

} catch {
    Write-ErrorMsg "Failed to query Clerk API"
    Write-Host ""
    Write-Host "Error details:" -ForegroundColor Red
    Write-Host $_.Exception.Message

    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode"

        if ($statusCode -eq 401) {
            Write-ErrorMsg "Authentication failed. Check your secret key."
        } elseif ($statusCode -eq 403) {
            Write-ErrorMsg "Access forbidden. Check API permissions."
        }
    }
}

Write-Host ""
Write-Header " Alternative: Check Clerk Dashboard Logs"
Write-Host ""
Write-Info "You can also view detailed logs in the Clerk Dashboard:"
Write-Host ""
Write-Host "  1. Go to: https://dashboard.clerk.com/logs" -ForegroundColor Cyan
Write-Host "  2. Search for trace ID: $TraceId" -ForegroundColor Cyan
Write-Host "  3. Click on the log entry to see full details" -ForegroundColor Cyan
Write-Host ""
Write-Info "Or try this direct link format (replace with your instance ID):"
Write-Host "  https://dashboard.clerk.com/apps/ins_***_INSTANCE_ID/logs" -ForegroundColor Cyan
Write-Host ""

Write-Host ""
Write-Header " Trace ID Query Complete"
Write-Host ""
