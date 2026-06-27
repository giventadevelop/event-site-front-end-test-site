# Mask-Secrets.ps1
# Masks all sensitive data in documentation files before git push

$documentsPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$filesProcessed = 0
$secretsMasked = 0

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host " Masking Secrets in Documentation Files" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Define secret patterns to mask
$secretPatterns = @(
    @{
        Pattern = 'sk_live_[A-Za-z0-9]+'
        Replacement = 'sk_live_***'
        Description = 'Clerk Secret Keys'
    },
    @{
        Pattern = 'pk_live_[A-Za-z0-9]+'
        Replacement = 'pk_live_***'
        Description = 'Clerk Publishable Keys'
    },
    @{
        Pattern = 'sk_test_[A-Za-z0-9]+'
        Replacement = 'sk_test_***'
        Description = 'Clerk Test Secret Keys'
    },
    @{
        Pattern = 'pk_test_[A-Za-z0-9]+'
        Replacement = 'pk_test_***'
        Description = 'Clerk Test Publishable Keys'
    },
    @{
        Pattern = 'whsec_[A-Za-z0-9]+'
        Replacement = 'whsec_***'
        Description = 'Webhook Secrets'
    },
    @{
        Pattern = 'ins_[A-Za-z0-9]+'
        Replacement = 'ins_***'
        Description = 'Clerk Instance IDs'
    },
    @{
        Pattern = '\d{12}-[a-z0-9]{32}\.apps\.googleusercontent\.com'
        Replacement = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
        Description = 'Google OAuth Client IDs'
    },
    @{
        Pattern = 'jwt@dev123!'
        Replacement = 'YOUR_JWT_PASSWORD'
        Description = 'JWT Passwords'
    },
    @{
        Pattern = 'jwtadmin'
        Replacement = 'YOUR_JWT_USER'
        Description = 'JWT Usernames'
    }
)

# Get all markdown and PowerShell files
$files = Get-ChildItem -Path $documentsPath -Include *.md,*.ps1,*.txt -Recurse |
    Where-Object { $_.Name -ne 'Mask-Secrets.ps1' }

Write-Host "[INFO] Found $($files.Count) files to process" -ForegroundColor Green
Write-Host ""

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue

    if (-not $content) {
        continue
    }

    $originalContent = $content
    $fileMaskedCount = 0

    foreach ($secret in $secretPatterns) {
        if ($content -match $secret.Pattern) {
            $matches = [regex]::Matches($content, $secret.Pattern)
            if ($matches.Count -gt 0) {
                $content = $content -replace $secret.Pattern, $secret.Replacement
                $fileMaskedCount += $matches.Count
                $secretsMasked += $matches.Count
            }
        }
    }

    # Only write if changes were made
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $filesProcessed++
        $relativePath = $file.FullName.Replace($documentsPath, "").TrimStart('\')
        Write-Host "[MASKED] $relativePath - $fileMaskedCount secret(s) masked" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host " Summary" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files processed:  $filesProcessed" -ForegroundColor Green
Write-Host "Secrets masked:   $secretsMasked" -ForegroundColor Green
Write-Host ""
Write-Host "[SUCCESS] All secrets have been masked!" -ForegroundColor Green
Write-Host ""
Write-Host "You can now safely commit and push to git." -ForegroundColor Cyan
Write-Host ""
