# Test script to verify env file parsing logic (PowerShell)
# Usage: .\scripts\test-env-parsing.ps1 [-EnvFile ".env.test"]

param(
    [string]$EnvFile = ".env.test"
)

if (-not (Test-Path $EnvFile)) {
    Write-Host "❌ Test file '$EnvFile' not found!" -ForegroundColor Red
    exit 1
}

Write-Host "🧪 Testing environment variable parsing" -ForegroundColor Cyan
Write-Host "   File: $EnvFile"
Write-Host ""

$envVars = @{}
$lineNum = 0

Get-Content $EnvFile | ForEach-Object {
    $lineNum++
    $line = $_.Trim()

    # Skip empty lines
    if ($line -eq "") {
        Write-Host "Line $lineNum : [SKIP] Empty line" -ForegroundColor Gray
        return
    }

    # Skip comment lines
    if ($line.StartsWith("#")) {
        $preview = if ($line.Length -gt 50) { $line.Substring(0, 50) + "..." } else { $line }
        Write-Host "Line $lineNum : [SKIP] Comment: $preview" -ForegroundColor Gray
        return
    }

    # Parse key=value
    if ($line -match "^([^=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()

        # Skip if key is empty
        if ([string]::IsNullOrWhiteSpace($key)) {
            Write-Host "Line $lineNum : [SKIP] Empty key" -ForegroundColor Yellow
            return
        }

        # Remove inline comments (everything after # not in quotes)
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

        Write-Host "Line $lineNum : [OK] $key = $value" -ForegroundColor Green
        $envVars[$key] = $value
    } else {
        Write-Host "Line $lineNum : [SKIP] No '=' found: $line" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   Total variables parsed: $($envVars.Count)" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Parsed variables:" -ForegroundColor Cyan
$envVars.GetEnumerator() | Sort-Object Name | ForEach-Object {
    Write-Host "   $($_.Key) = $($_.Value)"
}

Write-Host ""
Write-Host "📋 As JSON:" -ForegroundColor Cyan
$envVars | ConvertTo-Json | Write-Host
