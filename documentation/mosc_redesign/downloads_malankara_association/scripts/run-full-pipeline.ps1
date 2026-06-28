# Full downloads migration pipeline — run from repo root
# Usage: .\run-full-pipeline.ps1 -Step seed|covers|manifest|fetch|upload-dry|upload|all

param(
    [ValidateSet('seed', 'covers', 'manifest', 'fetch', 'upload-dry', 'upload', 'all')]
    [string]$Step = 'all'
)

$ErrorActionPreference = 'Stop'
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..\..\..')
Set-Location $RepoRoot

if (-not $env:MOSC_DOWNLOAD_ROOT) {
    $env:MOSC_DOWNLOAD_ROOT = Join-Path $RepoRoot 'mosc_downloads'
}
$env:MOSC_UPLOAD_LIMIT = '0'

function Invoke-Npm([string]$ScriptName) {
    Write-Host "`n=== npm run $ScriptName ===" -ForegroundColor Cyan
    npm run $ScriptName
    if ($LASTEXITCODE -ne 0) { throw "npm run $ScriptName failed with exit $LASTEXITCODE" }
}

function Invoke-DocScript([string]$Name) {
    Write-Host "`n=== node documentation/.../scripts/$Name ===" -ForegroundColor Cyan
    node (Join-Path $PSScriptRoot $Name)
    if ($LASTEXITCODE -ne 0) { throw "node $Name failed with exit $LASTEXITCODE" }
}

switch ($Step) {
    'seed' {
        Invoke-DocScript 'run-seed-categories.mjs'
        Invoke-DocScript 'seed-manifest-categories.mjs'
        Invoke-DocScript 'seed-extra-categories.mjs'
        Invoke-DocScript 'seed-charge-category.mjs'
        Invoke-DocScript 'list-missing-categories.mjs'
    }
    'covers' { Invoke-Npm 'mosc:migration:covers:build' }
    'manifest' {
        Invoke-Npm 'mosc:migration:full:manifest'
        Invoke-Npm 'mosc:migration:malankara:manifest'
    }
    'fetch' { Invoke-Npm 'mosc:migration:full:fetch' }
    'upload-dry' { Invoke-Npm 'mosc:migration:full:upload:dry' }
    'upload' { Invoke-Npm 'mosc:migration:full:upload:missing' }
    'all' {
        & $PSCommandPath -Step seed
        & $PSCommandPath -Step covers
        & $PSCommandPath -Step manifest
        & $PSCommandPath -Step fetch
        & $PSCommandPath -Step upload-dry
        & $PSCommandPath -Step upload
    }
}

Write-Host "`nDone ($Step)." -ForegroundColor Green
