# Profile Audience CRM v2 — Build Script
# Runs builds in dependency order: service → batch-jobs → mosc-temp → event-site-manager

param(
    [switch]$SkipService,
    [switch]$SkipBatch,
    [switch]$SkipMoscTemp,
    [switch]$SkipEsm
)

$ErrorActionPreference = 'Stop'
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$service = Join-Path $root 'event-site-manager-service'
$batch = Join-Path $root 'event-site-manager-batch-jobs'
$mosc = Join-Path $root 'mosc-temp'
$esm = Join-Path $root 'event-site-manager'

function Run-Step($label, $path, $command) {
    Write-Host "`n=== $label ===" -ForegroundColor Cyan
    if (-not (Test-Path $path)) {
        Write-Warning "Path not found: $path — skipping"
        return
    }
    Push-Location $path
    try {
        Invoke-Expression $command
        if ($LASTEXITCODE -ne 0) { throw "Command failed with exit code $LASTEXITCODE" }
    } finally {
        Pop-Location
    }
}

if (-not $SkipService) {
    Run-Step 'event-site-manager-service (Maven compile)' $service './mvnw.cmd -q -DskipTests compile'
}

if (-not $SkipBatch) {
    Run-Step 'event-site-manager-batch-jobs (Maven compile)' $batch './mvnw.cmd -q -DskipTests compile'
}

if (-not $SkipMoscTemp) {
    Run-Step 'mosc-temp (npm lint)' $mosc 'npm run lint --if-present'
}

if (-not $SkipEsm) {
    Run-Step 'event-site-manager (npm lint)' $esm 'npm run lint --if-present'
}

Write-Host "`nProfile Audience CRM v2 build sequence complete." -ForegroundColor Green
