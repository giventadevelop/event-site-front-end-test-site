# Test syntax
$result = @{
    Success = $true
    NewCount = 1
    DuplicateCount = 0
    ExistingCount = 1
    TotalCount = 2
}

$Origins = @("https://example.com")

if ($result.Success) {
    Write-Host "Success"

    if ($result.NewCount -gt 0) {
        Write-Host "Newly added origins:"
        Write-Host ""
        foreach ($origin in $Origins) {
            Write-Host "  + $origin"
        }
    }

    if ($result.DuplicateCount -gt 0) {
        Write-Host ""
        Write-Host "Note: Some origins were already configured and were skipped."
    }

    Write-Host ""
    Write-Host "Next Steps:"
    Write-Host "  1. Wait 2-5 minutes for changes to take effect"
    Write-Host "  2. Clear browser cache and cookies"
    Write-Host "  3. Visit your application and test authentication"
    Write-Host "  4. Run Get-ClerkAllowedOrigins.ps1 to verify all origins"
    Write-Host ""
}
else {
    Write-Host "Failed"
    Write-Host ""
    Write-Host "Possible causes:"
    Write-Host "  - Invalid secret key"
    Write-Host "  - Secret key is for different Clerk instance"
    Write-Host "  - Network connectivity issues"
    Write-Host "  - Clerk API is temporarily unavailable"
    Write-Host ""
    Write-Host "Troubleshooting:"
    Write-Host "  1. Verify your secret key in Clerk Dashboard - Developers - API Keys"
    Write-Host "  2. Ensure the key starts with sk_live_ for production"
    Write-Host "  3. Check your internet connection"
    Write-Host "  4. Try again in a few minutes"
    Write-Host ""
}

Write-Host "Test completed successfully"
