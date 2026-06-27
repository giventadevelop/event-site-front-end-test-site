# PowerShell script to set AWS Amplify environment variables in bulk
# Usage: .\scripts\set-amplify-env-vars.ps1 [-EnvFile ".env.production"] [-BranchName "main"] [-AppId "xxx"] [-Region "us-east-1"]
# Examples:
#   .\scripts\set-amplify-env-vars.ps1 -EnvFile ".env.production"
#   .\scripts\set-amplify-env-vars.ps1 -EnvFile ".env.development" -BranchName "feature_Common_Clerk"
#   .\scripts\set-amplify-env-vars.ps1 -EnvFile ".env.amplify" -BranchName "main" -AppId "d1508w3f27cyps" -Region "us-east-1"

param(
    [string]$EnvFile = ".env.amplify",
    [string]$BranchName = "feature_Common_Clerk",
    [string]$AppId = "d1508w3f27cyps",
    [string]$Region = "us-east-1"
)

# Check if AWS CLI is installed
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] AWS CLI is not installed. Please install it first." -ForegroundColor Red
    Write-Host "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
}

# Check if env file exists
if (-not (Test-Path $EnvFile)) {
    Write-Host "[ERROR] Environment file '$EnvFile' not found!" -ForegroundColor Red
    Write-Host "   Available .env files:" -ForegroundColor Yellow
    Get-ChildItem -Path . -Filter ".env*" | ForEach-Object { Write-Host "   - $($_.Name)" }
    exit 1
}

Write-Host "[INFO] Setting up environment variables for Amplify app" -ForegroundColor Green
Write-Host "   App ID: $AppId"
Write-Host "   Branch: $BranchName"
Write-Host "   Region: $Region"
Write-Host "   Env File: $EnvFile"
Write-Host ""

# Read the .env file and convert to JSON
$envVars = @{}
Get-Content $EnvFile | ForEach-Object {
    $line = $_.Trim()

    # Skip empty lines
    if ($line -eq "") {
        return
    }

    # Skip comment lines (lines starting with #)
    if ($line.StartsWith("#")) {
        return
    }

    # Parse key=value
    if ($line -match "^([^=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()

        # Skip if key is empty
        if ([string]::IsNullOrWhiteSpace($key)) {
            return
        }

        # Remove inline comments (everything after # not in quotes)
        # Simple approach: if value doesn't start with quote, remove # and everything after
        if (-not ($value.StartsWith('"') -or $value.StartsWith("'"))) {
            if ($value -match "^([^#]*)(#.*)$") {
                $value = $matches[1].Trim()
            }
        }

        # Remove surrounding quotes if present
        if ($value -match '^"(.*)"$') {
            $value = $matches[1]
        } elseif ($value -match "^'(.*)'$") {
            $value = $matches[1]
        }

        $envVars[$key] = $value
    }
}

# Check if we have any variables to set
if ($envVars.Count -eq 0) {
    Write-Host "[WARNING] No environment variables found in $EnvFile" -ForegroundColor Yellow
    Write-Host "   Make sure the file has valid KEY=VALUE pairs"
    exit 1
}

Write-Host "[INFO] Environment variables to set:" -ForegroundColor Cyan
$envVars.Keys | Sort-Object | ForEach-Object { Write-Host "   - $_" }
Write-Host ""
Write-Host "Found $($envVars.Count) environment variable(s)" -ForegroundColor Green
Write-Host ""

# Convert to JSON for AWS CLI
$envVarsJson = $envVars | ConvertTo-Json -Compress

# Save to temporary file to avoid escaping issues - use ASCII encoding without BOM
$tempFile = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($tempFile, $envVarsJson, [System.Text.Encoding]::ASCII)

# Update Amplify app environment variables
Write-Host "[INFO] Updating environment variables..." -ForegroundColor Yellow

$result = aws amplify update-app `
    --app-id $AppId `
    --environment-variables "file://$tempFile" `
    --region $Region 2>&1

# Clean up temp file
Remove-Item $tempFile -ErrorAction SilentlyContinue

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[SUCCESS] Environment variables updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "[NOTE] You may need to redeploy your app for changes to take effect:" -ForegroundColor Yellow
    Write-Host "   aws amplify start-job --app-id $AppId --branch-name $BranchName --job-type RELEASE --region $Region"
} else {
    Write-Host ""
    Write-Host "[ERROR] Failed to update environment variables" -ForegroundColor Red
    Write-Host $result
    exit 1
}
