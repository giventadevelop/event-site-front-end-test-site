# Standalone Script to Scan and Delete Files with Reserved Device Names (NUL, CON, PRN, etc.)
# Project: malayalees-us-site-boot
# Purpose: Automatically find and remove problematic files created by corrupted scripts

param(
  [string]$ScanPath = "",
  [switch]$WhatIf,
  [switch]$AutoDelete,
  [switch]$Interactive,
  [switch]$NulOnly,
  [bool]$Recursive = $true,
  [string[]]$ExcludePaths = @()
)

# If ScanPath not provided, default to project root (one level up from scripts folder)
if ([string]::IsNullOrEmpty($ScanPath)) {
  $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
  $ScanPath = (Get-Item $ScriptDir).Parent.FullName
}

# All Windows reserved device names
$reservedNames = @('CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9')

# Filter to NUL only if requested
if ($NulOnly) {
  $reservedNames = @('NUL')
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Reserved Device Name File Cleaner" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Scanning path: $ScanPath" -ForegroundColor Yellow
Write-Host "Mode: " -NoNewline -ForegroundColor Yellow
if ($WhatIf) {
  Write-Host "DRY RUN (preview only)" -ForegroundColor Gray
}
elseif ($AutoDelete) {
  Write-Host "AUTO DELETE (no confirmation)" -ForegroundColor Red
}
elseif ($Interactive) {
  Write-Host "INTERACTIVE (prompt for each file)" -ForegroundColor Cyan
}
else {
  Write-Host "SCAN ONLY (list files only)" -ForegroundColor Green
}
Write-Host ""

# Function to check if path should be excluded
function Test-ExcludedPath {
  param([string]$FilePath)

  foreach ($exclude in $ExcludePaths) {
    if ($FilePath -like "*$exclude*") {
      return $true
    }
  }
  return $false
}

# Function to delete a file with reserved device name
function Remove-ReservedDeviceFile {
  param(
    [string]$FilePath,
    [bool]$WhatIfMode = $false
  )

  if ($WhatIfMode) {
    Write-Host "    [DRY RUN] Would delete: $FilePath" -ForegroundColor Gray
    return $true
  }

  try {
    # Use cmd.exe with \\?\ prefix to bypass Windows reserved name validation
    $literalPath = "\\?\$FilePath"
    $result = cmd /c del '"' + $literalPath + '"' 2>&1

    if ($LASTEXITCODE -eq 0) {
      Write-Host "    [OK] Deleted: $FilePath" -ForegroundColor Green
      return $true
    }
    else {
      Write-Host "    [FAIL] Failed to delete: $FilePath" -ForegroundColor Red
      Write-Host "      Error: $result" -ForegroundColor Red
      return $false
    }
  }
  catch {
    Write-Host "    [FAIL] Exception deleting: $FilePath" -ForegroundColor Red
    Write-Host "      Error: $_" -ForegroundColor Red
    return $false
  }
}

# Scan for files with reserved device names
Write-Host "Scanning for files with reserved device names..." -ForegroundColor Yellow
Write-Host "  Target names: $($reservedNames -join ', ')" -ForegroundColor Gray
Write-Host ""

if (-not (Test-Path $ScanPath)) {
  Write-Host "[ERROR] Path does not exist: $ScanPath" -ForegroundColor Red
  exit 1
}

$foundFiles = @()
$scanCount = 0

foreach ($name in $reservedNames) {
  Write-Host "  Checking for '$name' files..." -NoNewline -ForegroundColor Gray

  try {
    # Use cmd.exe dir command with /s for recursive search
    if ($Recursive) {
      $searchCmd = 'dir "' + $ScanPath + '" /s /b 2>&1 | findstr /i /r "\\' + $name + '$"'
    }
    else {
      $searchCmd = 'dir "' + $ScanPath + '" /b 2>&1 | findstr /i /r "^' + $name + '$"'
    }

    $files = cmd /c $searchCmd 2>&1 | Where-Object { $_ -and $_ -match "\\$name$" -and (Test-Path $_) }

    if ($files) {
      foreach ($file in $files) {
        $filePath = $file.Trim()

        # Check if file actually exists (double-check)
        if ((Test-Path -LiteralPath $filePath -ErrorAction SilentlyContinue) -or
          (Test-Path -LiteralPath "\\?\$filePath" -ErrorAction SilentlyContinue)) {

          # Skip if in excluded paths
          if (-not (Test-ExcludedPath -FilePath $filePath)) {
            $foundFiles += $filePath
          }
        }
      }
      Write-Host " Found $($files.Count)" -ForegroundColor Yellow
    }
    else {
      Write-Host " None" -ForegroundColor Gray
    }
  }
  catch {
    Write-Host " Error: $_" -ForegroundColor Red
  }
}

Write-Host ""

# Display results
if ($foundFiles.Count -eq 0) {
  Write-Host "[OK] No files with reserved device names found!" -ForegroundColor Green
  Write-Host ""
  exit 0
}

Write-Host "Found $($foundFiles.Count) file(s) with reserved device names:" -ForegroundColor Red
Write-Host ""

$deleteCount = 0
$skipCount = 0
$errorCount = 0

foreach ($file in $foundFiles) {
  Write-Host "  - $file" -ForegroundColor Yellow

  # Determine action based on mode
  $shouldDelete = $false

  if ($WhatIf) {
    Remove-ReservedDeviceFile -FilePath $file -WhatIfMode $true | Out-Null
    $deleteCount++
  }
  elseif ($AutoDelete) {
    $shouldDelete = $true
  }
  elseif ($Interactive) {
    $response = Read-Host "    Delete this file? (Y/N)"
    if ($response -match '^[Yy]') {
      $shouldDelete = $true
    }
    else {
      Write-Host "    Skipped" -ForegroundColor Gray
      $skipCount++
    }
  }
  else {
    Write-Host "    To delete: cmd /c del `"\\?\$file`"" -ForegroundColor Gray
  }

  if ($shouldDelete) {
    if (Remove-ReservedDeviceFile -FilePath $file) {
      $deleteCount++
    }
    else {
      $errorCount++
    }
  }

  Write-Host ""
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Files found:    $($foundFiles.Count)" -ForegroundColor White
Write-Host "  Files deleted:  $deleteCount" -ForegroundColor $(if ($deleteCount -gt 0) { "Green" } else { "Gray" })
Write-Host "  Files skipped:  $skipCount" -ForegroundColor $(if ($skipCount -gt 0) { "Yellow" } else { "Gray" })
Write-Host "  Errors:         $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Gray" })
Write-Host ""

if ($deleteCount -gt 0) {
  Write-Host "[OK] Cleanup complete!" -ForegroundColor Green
}

Write-Host ""
Write-Host "USAGE:" -ForegroundColor Yellow
Write-Host "  # Scan only (default - lists files without deleting)" -ForegroundColor Gray
Write-Host "  .\delete-nul-files.ps1" -ForegroundColor White
Write-Host ""
Write-Host "  # Scan specific directory" -ForegroundColor Gray
Write-Host "  .\delete-nul-files.ps1 -ScanPath 'C:\Users\gain\git'" -ForegroundColor White
Write-Host ""
Write-Host "  # Dry run (preview what would be deleted)" -ForegroundColor Gray
Write-Host "  .\delete-nul-files.ps1 -WhatIf" -ForegroundColor White
Write-Host ""
Write-Host "  # Auto-delete all found files (no confirmation)" -ForegroundColor Gray
Write-Host "  .\delete-nul-files.ps1 -AutoDelete" -ForegroundColor White
Write-Host ""
Write-Host "  # Interactive mode (prompt for each file)" -ForegroundColor Gray
Write-Host "  .\delete-nul-files.ps1 -Interactive" -ForegroundColor White
Write-Host ""
Write-Host "  # Only scan for NUL files (not other reserved names)" -ForegroundColor Gray
Write-Host "  .\delete-nul-files.ps1 -NulOnly" -ForegroundColor White
Write-Host ""
Write-Host "  # Non-recursive scan (current directory only)" -ForegroundColor Gray
Write-Host "  .\delete-nul-files.ps1 -Recursive `$false" -ForegroundColor White
Write-Host ""
Write-Host "  # Exclude certain paths from scanning" -ForegroundColor Gray
Write-Host "  .\delete-nul-files.ps1 -ExcludePaths @('node_modules', '.git')" -ForegroundColor White
Write-Host ""

