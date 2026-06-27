# ==============================================================================
# Get-ClerkAllowedOrigins.ps1
# ==============================================================================
# Description: Retrieve and display currently whitelisted domains in Clerk
# Author: System Administrator
# Created: 2025-01-21
# ==============================================================================

<#
.SYNOPSIS
    Retrieves the list of allowed origins from your Clerk instance.

.DESCRIPTION
    This script queries the Clerk Backend API to retrieve the current list
    of allowed origins (whitelisted domains) configured in your Clerk instance.

.PARAMETER SecretKey
    The Clerk secret key (sk_live_*). If not provided, will attempt to read
    from .env.production or prompt for input.

.PARAMETER EnvFilePath
    Path to .env.production file. Defaults to relative path from script location.

.PARAMETER Export
    Export the results to a JSON file.

.PARAMETER OutputPath
    Path where to save the exported JSON file. Defaults to current directory.

.EXAMPLE
    .\Get-ClerkAllowedOrigins.ps1
    Retrieves and displays allowed origins

.EXAMPLE
    .\Get-ClerkAllowedOrigins.ps1 -SecretKey "sk_live_..."
    Provide secret key as parameter

.EXAMPLE
    .\Get-ClerkAllowedOrigins.ps1 -Export -OutputPath ".\clerk-config.json"
    Export configuration to JSON file
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false, HelpMessage="Clerk secret key (sk_live_*)")]
    [string]$SecretKey,

    [Parameter(Mandatory=$false, HelpMessage="Path to .env.production file")]
    [string]$EnvFilePath,

    [Parameter(Mandatory=$false, HelpMessage="Export results to JSON file")]
    [switch]$Export,

    [Parameter(Mandatory=$false, HelpMessage="Path for exported JSON file")]
    [string]$OutputPath = ".\clerk-allowed-origins.json"
)

# ==============================================================================
# Configuration
# ==============================================================================

$ClerkApiUrl = "https://api.clerk.com/v1/instance"
$ScriptVersion = "1.0.0"
$DefaultEnvPath = "..\..\..\.env.production"

# ==============================================================================
# Helper Functions
# ==============================================================================

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "================================================================================" -ForegroundColor Cyan
    Write-Host " $Title" -ForegroundColor Cyan
    Write-Host "================================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
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

    if ($Key -match "^sk_(live|test)_[A-Za-z0-9]+$") {
        return $true
    }

    return $false
}

function Get-SecretKeyFromUser {
    Write-Header "Clerk Secret Key Required"

    Write-Host "Your Clerk secret key is needed to retrieve configuration."
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

function Invoke-ClerkGetRequest {
    param(
        [string]$ApiUrl,
        [string]$SecretKey
    )

    Write-Info "Preparing GET request to Clerk API..."

    $headers = @{
        "Authorization" = "Bearer $SecretKey"
        "Accept" = "application/json"
    }

    Write-Info "Sending GET request to: $ApiUrl"

    try {
        $response = Invoke-RestMethod -Uri $ApiUrl -Method GET -Headers $headers -ErrorAction Stop
        return @{
            Success = $true
            Response = $response
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

Write-Header "Clerk Allowed Origins Retrieval Script v$ScriptVersion"

# Step 1: Get Secret Key
if ([string]::IsNullOrWhiteSpace($SecretKey)) {
    Write-Info "Secret key not provided as parameter"

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
    }
}
else {
    if (-not (Test-SecretKey -Key $SecretKey)) {
        Write-Error "Provided secret key is invalid"
        exit 1
    }
    Write-Success "Secret key provided as parameter"
}

# Step 2: Make API Request
Write-Header "Retrieving Clerk Configuration"

$result = Invoke-ClerkGetRequest -ApiUrl $ClerkApiUrl -SecretKey $SecretKey

# Step 3: Display Results
Write-Header "Clerk Instance Configuration"

if ($result.Success) {
    $config = $result.Response

    Write-Success "Configuration retrieved successfully!"
    Write-Host ""

    # Display instance information
    if ($config.PSObject.Properties['id']) {
        Write-Host "Instance ID:     " -NoNewline
        Write-Host $config.id -ForegroundColor Yellow
    }

    if ($config.PSObject.Properties['environment_type']) {
        Write-Host "Environment:     " -NoNewline
        $envType = $config.environment_type
        $envColor = if ($envType -eq "production") { "Red" } else { "Green" }
        Write-Host $envType.ToUpper() -ForegroundColor $envColor
    }

    Write-Host ""

    # Display allowed origins
    if ($config.PSObject.Properties['allowed_origins']) {
        $origins = $config.allowed_origins

        if ($null -eq $origins -or $origins.Count -eq 0) {
            Write-Warning "No allowed origins configured"
            Write-Host ""
            Write-Host "This means your Clerk instance may have default CORS settings." -ForegroundColor Yellow
            Write-Host "Run Add-ClerkAllowedOrigins.ps1 to configure specific domains." -ForegroundColor Yellow
        }
        else {
            Write-Host "Allowed Origins: " -NoNewline
            Write-Host $origins.Count -ForegroundColor Green
            Write-Host ""

            foreach ($origin in $origins) {
                Write-Host "  - $origin" -ForegroundColor Cyan
            }
        }
    }
    else {
        Write-Info "allowed_origins field not found in response"
        Write-Host ""
        Write-Host "Available fields:" -ForegroundColor Yellow
        $config.PSObject.Properties | ForEach-Object {
            Write-Host "  - $($_.Name)" -ForegroundColor Gray
        }
    }

    Write-Host ""

    # Export if requested
    if ($Export) {
        try {
            $exportData = @{
                retrieved_at = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
                instance_id = $config.id
                environment_type = $config.environment_type
                allowed_origins = $config.allowed_origins
            }

            $exportData | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutputPath -Encoding UTF8
            Write-Success "Configuration exported to: $OutputPath"
        }
        catch {
            Write-Error "Failed to export configuration: $_"
        }
    }

    exit 0
}
else {
    Write-Error "Failed to retrieve configuration"
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

    exit 1
}
