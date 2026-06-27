# ==============================================================================
# Add-ClerkAllowedOrigins.ps1
# ==============================================================================
# Description: Whitelist domains in Clerk instance for production authentication
# Author: System Administrator
# Created: 2025-01-21
# Updated: 2025-01-25 (Fixed to append + duplicate detection)
# ==============================================================================

<#
.SYNOPSIS
    Adds allowed origins (domains) to your Clerk instance configuration.

.DESCRIPTION
    This script configures allowed origins in your Clerk instance using the
    Clerk Backend API. It fetches existing origins, merges them with new ones
    (avoiding duplicates), and updates the configuration. It prompts for domains
    to whitelist and can optionally read the Clerk secret key from .env.production file.

    IMPORTANT:
    - This script APPENDS new origins to existing ones. It does NOT overwrite.
    - Duplicate detection: If you enter the same domain multiple times, it will be added only once.
    - If an origin already exists in Clerk, it will be skipped with a warning.

.PARAMETER SecretKey
    The Clerk secret key (sk_live_*). If not provided, will attempt to read
    from .env.production or prompt for input.

.PARAMETER Origins
    Array of origin URLs to whitelist. If not provided, will prompt for input.

.PARAMETER EnvFilePath
    Path to .env.production file. Defaults to relative path from script location.

.PARAMETER Silent
    Suppress verbose output. Only show results.

.EXAMPLE
    .\Add-ClerkAllowedOrigins.ps1
    Prompts for all required information

.EXAMPLE
    .\Add-ClerkAllowedOrigins.ps1 -Origins @("https://example.com", "https://app.example.com")
    Whitelist specific domains (will prompt for secret key)

.EXAMPLE
    .\Add-ClerkAllowedOrigins.ps1 -SecretKey "sk_live_..." -Origins @("https://example.com")
    Provide both secret key and origins

.EXAMPLE
    .\Add-ClerkAllowedOrigins.ps1 -Silent
    Run in silent mode with minimal output
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false, HelpMessage="Clerk secret key (sk_live_*)")]
    [string]$SecretKey,

    [Parameter(Mandatory=$false, HelpMessage="Array of origin URLs to whitelist")]
    [string[]]$Origins,

    [Parameter(Mandatory=$false, HelpMessage="Path to .env.production file")]
    [string]$EnvFilePath,

    [Parameter(Mandatory=$false, HelpMessage="Suppress verbose output")]
    [switch]$Silent
)

# ==============================================================================
# Configuration
# ==============================================================================

$ClerkApiUrl = "https://api.clerk.com/v1/instance"
$ScriptVersion = "1.2.0"
$DefaultEnvPath = "..\..\..\.env.production"

# ==============================================================================
# Helper Functions
# ==============================================================================

function Write-Header {
    param([string]$Title)
    if (-not $Silent) {
        Write-Host ""
        Write-Host "================================================================================" -ForegroundColor Cyan
        Write-Host " $Title" -ForegroundColor Cyan
        Write-Host "================================================================================" -ForegroundColor Cyan
        Write-Host ""
    }
}

function Write-Info {
    param([string]$Message)
    if (-not $Silent) {
        Write-Host "[INFO] $Message" -ForegroundColor Green
    }
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Read-EnvFile {
    param(
        [string]$FilePath,
        [string]$KeyName
    )

    if (-not (Test-Path $FilePath)) {
        Write-Warning "Environment file not found: $FilePath"
        return $null
    }

    Write-Info "Reading $KeyName from: $FilePath"

    try {
        $content = Get-Content $FilePath -Raw

        # Try multiple possible key names
        $patterns = @(
            "^CLERK_SECRET_KEY=(.+)$",
            "^CLERK_SECRET_KEY='(.+)'$",
            "^CLERK_SECRET_KEY=`"(.+)`"$"
        )

        foreach ($pattern in $patterns) {
            if ($content -match $pattern) {
                $value = $Matches[1].Trim()
                Write-Info "Found $KeyName in environment file"
                return $value
            }
        }

        Write-Warning "$KeyName not found in environment file"
        return $null
    }
    catch {
        Write-Error "Error reading environment file: $_"
        return $null
    }
}

function Test-SecretKey {
    param([string]$Key)

    if ([string]::IsNullOrWhiteSpace($Key)) {
        return $false
    }

    # Check if key starts with sk_live_ or sk_test_
    if ($Key -match "^sk_(live|test)_[A-Za-z0-9]+$") {
        return $true
    }

    return $false
}

function Test-Origin {
    param([string]$Origin)

    if ([string]::IsNullOrWhiteSpace($Origin)) {
        return $false
    }

    # Check if origin is a valid URL
    try {
        $uri = [System.Uri]$Origin
        if ($uri.Scheme -in @("http", "https") -and $uri.Host) {
            return $true
        }
    }
    catch {
        return $false
    }

    return $false
}

function Get-SecretKeyFromUser {
    Write-Header "Clerk Secret Key Required"

    Write-Host "Your Clerk secret key is needed to configure allowed origins."
    Write-Host "The key should start with 'sk_live_' for production or 'sk_test_' for development."
    Write-Host ""

    $tryCount = 0
    $maxTries = 3

    while ($tryCount -lt $maxTries) {
        $key = Read-Host "Enter Clerk Secret Key (or 'exit' to cancel)"

        if ($key -eq "exit") {
            Write-Warning "Operation cancelled by user"
            exit 1
        }

        if (Test-SecretKey -Key $key) {
            return $key
        }

        $tryCount++
        Write-Error "Invalid secret key format. Must start with 'sk_live_' or 'sk_test_'"
        Write-Host "Attempts remaining: $($maxTries - $tryCount)" -ForegroundColor Yellow
        Write-Host ""
    }

    Write-Error "Maximum attempts reached. Exiting."
    exit 1
}

function Get-OriginsFromUser {
    Write-Header "Allowed Origins Configuration"

    Write-Host "Enter the domains you want to whitelist for Clerk authentication."
    Write-Host "These should be the full URLs where your application is deployed."
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  - https://www.example.com"
    Write-Host "  - https://app.example.com"
    Write-Host "  - https://feature-branch.amplifyapp.com"
    Write-Host "  - http://localhost:3000"
    Write-Host ""

    $originsList = @()
    $continueAdding = $true
    $index = 1

    while ($continueAdding) {
        Write-Host "Origin $index" -ForegroundColor Cyan
        $origin = Read-Host "Enter origin URL (or press Enter to finish)"

        if ([string]::IsNullOrWhiteSpace($origin)) {
            if ($originsList.Count -eq 0) {
                Write-Warning "At least one origin is required"
                continue
            }
            $continueAdding = $false
            break
        }

        if (Test-Origin -Origin $origin) {
            # Check for duplicates in the current input list
            if ($origin -in $originsList) {
                Write-Warning "Duplicate: '$origin' already entered. Skipping."
            }
            else {
                $originsList += $origin
                Write-Success "Added: $origin"
                $index++
            }
        }
        else {
            Write-Error "Invalid URL format. Please enter a valid HTTP/HTTPS URL."
        }

        Write-Host ""
    }

    return $originsList
}

function Get-ExistingAllowedOrigins {
    param(
        [string]$ApiUrl,
        [string]$SecretKey
    )

    Write-Info "Fetching existing allowed origins from Clerk..."

    $headers = @{
        "Authorization" = "Bearer $SecretKey"
    }

    try {
        $response = Invoke-RestMethod -Uri $ApiUrl -Method GET -Headers $headers -ErrorAction Stop

        if ($null -eq $response.allowed_origins) {
            Write-Info "No existing allowed origins found"
            return @()
        }

        Write-Success "Found $($response.allowed_origins.Count) existing allowed origin(s)"
        return $response.allowed_origins
    }
    catch {
        Write-Warning "Could not fetch existing origins: $($_.Exception.Message)"
        Write-Warning "Proceeding without merging with existing origins"
        return @()
    }
}

function Invoke-ClerkApiRequest {
    param(
        [string]$ApiUrl,
        [string]$SecretKey,
        [string[]]$AllowedOrigins
    )

    Write-Info "Preparing API request to Clerk..."

    # Step 1: Get existing allowed origins
    $existingOrigins = Get-ExistingAllowedOrigins -ApiUrl $ApiUrl -SecretKey $SecretKey

    # Step 2: Merge new origins with existing ones (avoid duplicates)
    $mergedOrigins = @()

    # Add all existing origins first
    foreach ($origin in $existingOrigins) {
        if ($origin -notin $mergedOrigins) {
            $mergedOrigins += $origin
        }
    }

    # Add new origins (skip if already exists)
    $newCount = 0
    $duplicateCount = 0
    foreach ($origin in $AllowedOrigins) {
        if ($origin -in $mergedOrigins) {
            Write-Warning "Origin already exists: $origin"
            $duplicateCount++
        }
        else {
            $mergedOrigins += $origin
            $newCount++
        }
    }

    Write-Info "Existing origins: $($existingOrigins.Count)"
    Write-Info "New origins to add: $newCount"
    Write-Info "Duplicates skipped: $duplicateCount"
    Write-Info "Total after merge: $($mergedOrigins.Count)"

    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $SecretKey"
    }

    $body = @{
        allowed_origins = $mergedOrigins
    } | ConvertTo-Json -Depth 10

    Write-Info "Sending PATCH request to: $ApiUrl"

    try {
        $response = Invoke-RestMethod -Uri $ApiUrl -Method PATCH -Headers $headers -Body $body -ErrorAction Stop
        return @{
            Success = $true
            Response = $response
            ExistingCount = $existingOrigins.Count
            NewCount = $newCount
            DuplicateCount = $duplicateCount
            TotalCount = $mergedOrigins.Count
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMessage = $_.Exception.Message

        return @{
            Success = $false
            StatusCode = $statusCode
            Error = $errorMessage
        }
    }
}

# ==============================================================================
# Main Script Logic
# ==============================================================================

Write-Header "Clerk Allowed Origins Configuration Script v$ScriptVersion"

# Step 1: Get Secret Key
if ([string]::IsNullOrWhiteSpace($SecretKey)) {
    Write-Info "Secret key not provided as parameter"

    # Try to read from .env.production
    if ([string]::IsNullOrWhiteSpace($EnvFilePath)) {
        $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
        $EnvFilePath = Join-Path $scriptDir $DefaultEnvPath
    }

    $SecretKey = Read-EnvFile -FilePath $EnvFilePath -KeyName "CLERK_SECRET_KEY"

    if ([string]::IsNullOrWhiteSpace($SecretKey) -or -not (Test-SecretKey -Key $SecretKey)) {
        Write-Warning "Could not read valid secret key from environment file"
        $SecretKey = Get-SecretKeyFromUser
    }
    else {
        Write-Success "Secret key loaded from environment file"

        # Mask the key for display
        $maskedKey = $SecretKey.Substring(0, 10) + "..." + $SecretKey.Substring($SecretKey.Length - 4)
        Write-Info "Using key: $maskedKey"
    }
}
else {
    if (-not (Test-SecretKey -Key $SecretKey)) {
        Write-Error "Provided secret key is invalid"
        exit 1
    }
    Write-Success "Secret key provided as parameter"
}

# Step 2: Get Origins
if ($null -eq $Origins -or $Origins.Count -eq 0) {
    Write-Info "Origins not provided as parameter"
    $Origins = Get-OriginsFromUser
}
else {
    Write-Success "Origins provided as parameter"

    # Validate all provided origins and remove duplicates
    $invalidOrigins = @()
    $uniqueOrigins = @()
    $duplicatesFound = @()

    foreach ($origin in $Origins) {
        if (-not (Test-Origin -Origin $origin)) {
            $invalidOrigins += $origin
        }
        elseif ($origin -in $uniqueOrigins) {
            $duplicatesFound += $origin
        }
        else {
            $uniqueOrigins += $origin
        }
    }

    if ($invalidOrigins.Count -gt 0) {
        Write-Error "Invalid origin URLs detected:"
        foreach ($invalid in $invalidOrigins) {
            Write-Host "  - $invalid" -ForegroundColor Red
        }
        exit 1
    }

    if ($duplicatesFound.Count -gt 0) {
        Write-Warning "Duplicate origins detected in parameters and removed:"
        foreach ($dup in $duplicatesFound) {
            Write-Host "  - $dup" -ForegroundColor Yellow
        }
    }

    # Use deduplicated list
    $Origins = $uniqueOrigins
}

# Step 3: Display Summary
Write-Header "Configuration Summary"

Write-Host "Secret Key:      " -NoNewline
$maskedKey = $SecretKey.Substring(0, 10) + "..." + $SecretKey.Substring($SecretKey.Length - 4)
Write-Host $maskedKey -ForegroundColor Yellow

Write-Host "Origins to add:  " -NoNewline
Write-Host $Origins.Count -ForegroundColor Yellow
Write-Host ""

foreach ($origin in $Origins) {
    Write-Host "  - $origin" -ForegroundColor Cyan
}

Write-Host ""
$confirm = Read-Host "Proceed with configuration? (Y/N)"

if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Warning "Operation cancelled by user"
    exit 0
}

# Step 4: Make API Request
Write-Header "Updating Clerk Configuration"

$result = Invoke-ClerkApiRequest -ApiUrl $ClerkApiUrl -SecretKey $SecretKey -AllowedOrigins $Origins

# Step 5: Display Results
Write-Header "Results"

if ($result.Success) {
    Write-Success "Allowed origins successfully updated!"
    Write-Host ""

    # Show merge statistics
    Write-Host "Configuration Summary:" -ForegroundColor Cyan
    Write-Host "  Existing origins:     $($result.ExistingCount)" -ForegroundColor Yellow
    Write-Host "  New origins added:    $($result.NewCount)" -ForegroundColor Green
    Write-Host "  Duplicates skipped:   $($result.DuplicateCount)" -ForegroundColor Gray
    Write-Host "  Total origins now:    $($result.TotalCount)" -ForegroundColor Cyan
    Write-Host ""

    if ($result.NewCount -gt 0) {
        Write-Host "Newly added origins:" -ForegroundColor Green
        Write-Host ""
        foreach ($origin in $Origins) {
            Write-Host "  + $origin" -ForegroundColor Green
        }
    }

    if ($result.DuplicateCount -gt 0) {
        Write-Host ""
        Write-Host "Note: Some origins were already configured and were skipped." -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Info "Changes may take 2-5 minutes to propagate"
    Write-Info "Clear your browser cache before testing"
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Wait 2-5 minutes for changes to take effect"
    Write-Host "  2. Clear browser cache and cookies"
    Write-Host "  3. Visit your application and test authentication"
    Write-Host "  4. Run Get-ClerkAllowedOrigins.ps1 to verify all origins"
    Write-Host ""

    exit 0
}
else {
    Write-Error "Failed to configure allowed origins"
    Write-Host ""
    Write-Host "Status Code: $($result.StatusCode)" -ForegroundColor Red
    Write-Host "Error: $($result.Error)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible causes:" -ForegroundColor Yellow
    Write-Host "  - Invalid secret key"
    Write-Host "  - Secret key is for different Clerk instance"
    Write-Host "  - Network connectivity issues"
    Write-Host "  - Clerk API is temporarily unavailable"
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Verify your secret key in Clerk Dashboard - Developers - API Keys"
    Write-Host "  2. Ensure the key starts with sk_live_ for production"
    Write-Host "  3. Check your internet connection"
    Write-Host "  4. Try again in a few minutes"
    Write-Host ""

    exit 1
}
