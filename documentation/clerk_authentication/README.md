# Clerk Authentication Configuration Scripts

This directory contains PowerShell scripts for managing Clerk authentication configuration, specifically for whitelisting allowed origins (domains) in your Clerk instance.

## Scripts Overview

### 1. Add-ClerkAllowedOrigins.ps1
Adds allowed origins to your Clerk instance configuration.

### 2. Get-ClerkAllowedOrigins.ps1
Retrieves and displays currently configured allowed origins.

## Prerequisites

- PowerShell 5.1 or later (Windows)
- PowerShell Core 7+ (Windows, Linux, macOS)
- Network access to Clerk API (api.clerk.com)
- Valid Clerk secret key (sk_live_* for production)

## Quick Start

### Add Allowed Origins (Interactive Mode)

```powershell
cd documentation/clerk_authentication
.\Add-ClerkAllowedOrigins.ps1
```

The script will:
1. Attempt to read CLERK_SECRET_KEY from .env.production
2. If not found, prompt you to enter it
3. Prompt you to enter origin URLs one by one
4. Confirm before making changes
5. Update your Clerk instance configuration

### View Current Configuration

```powershell
.\Get-ClerkAllowedOrigins.ps1
```

This will display all currently whitelisted origins in your Clerk instance.

## Usage Examples

### Example 1: Interactive Mode (Recommended for First-Time Users)

```powershell
.\Add-ClerkAllowedOrigins.ps1
```

You will be prompted for:
- Clerk secret key (or it will be read from .env.production)
- Each origin URL to whitelist

### Example 2: Provide Origins as Parameters

```powershell
.\Add-ClerkAllowedOrigins.ps1 -Origins @(
    "https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com",
    "https://www.adwiise.com",
    "http://localhost:3000"
)
```

### Example 3: Provide Both Secret Key and Origins

```powershell
$secretKey = "sk_live_***_actual_secret_key_here"
$origins = @(
    "https://app.example.com",
    "https://www.example.com"
)

.\Add-ClerkAllowedOrigins.ps1 -SecretKey $secretKey -Origins $origins
```

### Example 4: Silent Mode (Minimal Output)

```powershell
.\Add-ClerkAllowedOrigins.ps1 -Origins @("https://example.com") -Silent
```

### Example 5: View Configuration and Export to JSON

```powershell
.\Get-ClerkAllowedOrigins.ps1 -Export -OutputPath ".\my-clerk-config.json"
```

## Environment File Integration

Both scripts can automatically read the Clerk secret key from your .env.production file.

### Expected .env.production Format

```bash
# Clerk Configuration
CLERK_SECRET_KEY=sk_live_***_actual_secret_key_here
```

### Custom Environment File Path

If your .env.production is in a different location:

```powershell
.\Add-ClerkAllowedOrigins.ps1 -EnvFilePath "C:\path\to\your\.env.production"
```

## Common Use Cases

### Use Case 1: Whitelist AWS Amplify Deployment

```powershell
.\Add-ClerkAllowedOrigins.ps1 -Origins @(
    "https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com"
)
```

### Use Case 2: Add Multiple Environments

```powershell
.\Add-ClerkAllowedOrigins.ps1 -Origins @(
    "https://www.adwiise.com",                                      # Production
    "https://staging.adwiise.com",                                  # Staging
    "https://feature-common-clerk.d1508w3f27cyps.amplifyapp.com",  # AWS Amplify
    "http://localhost:3000"                                         # Local development
)
```

### Use Case 3: Update Configuration for New Branch Deployment

```powershell
# First, check current configuration
.\Get-ClerkAllowedOrigins.ps1

# Add new branch deployment
.\Add-ClerkAllowedOrigins.ps1 -Origins @(
    "https://new-feature-branch.amplifyapp.com"
)

# Verify the update
.\Get-ClerkAllowedOrigins.ps1
```

## Troubleshooting

### Error: "Invalid secret key format"

**Solution:**
- Verify your secret key starts with `sk_live_` (production) or `sk_test_` (development)
- Check for extra spaces or quotes
- Ensure you copied the complete key from Clerk Dashboard

### Error: "Failed to configure allowed origins - Status Code: 401"

**Solution:**
- Secret key is invalid or expired
- Go to Clerk Dashboard > Developers > API Keys
- Copy the correct secret key
- Try again

### Error: "Failed to configure allowed origins - Status Code: 403"

**Solution:**
- Secret key may not have permission to modify instance settings
- Ensure you're using an Admin-level secret key
- Contact Clerk support if issue persists

### Error: "Invalid URL format"

**Solution:**
- Ensure URLs start with `http://` or `https://`
- Check for typos in domain names
- Remove trailing slashes

Example valid formats:
```
https://www.example.com        # Correct
https://app.example.com        # Correct
http://localhost:3000          # Correct
```

Example invalid formats:
```
www.example.com                # Missing protocol
https://www.example.com/       # Trailing slash (remove it)
example.com                    # Missing protocol
```

### Script Doesn't Find .env.production

**Solution:**
The script looks for .env.production at: `../../../.env.production` relative to the script location.

If your file is elsewhere:
```powershell
.\Add-ClerkAllowedOrigins.ps1 -EnvFilePath "C:\full\path\to\.env.production"
```

### Changes Don't Take Effect Immediately

**Solution:**
Clerk configuration changes can take 2-5 minutes to propagate.

1. Wait 2-5 minutes after running the script
2. Clear browser cache and cookies
3. Test your application
4. Run `Get-ClerkAllowedOrigins.ps1` to verify configuration

## Security Best Practices

### 1. Protect Your Secret Key

- NEVER commit secret keys to version control
- Store secret keys in .env files that are in .gitignore
- Use environment-specific keys (test for dev, live for production)
- Rotate keys regularly

### 2. Whitelist Only Necessary Domains

- Only add domains where your application is deployed
- Remove old/unused domains periodically
- Use HTTPS for production domains
- Avoid wildcards if possible

### 3. Regular Configuration Audits

```powershell
# Monthly: Review current configuration
.\Get-ClerkAllowedOrigins.ps1 -Export -OutputPath "clerk-audit-$(Get-Date -Format 'yyyy-MM-dd').json"
```

## Script Parameters Reference

### Add-ClerkAllowedOrigins.ps1 Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| SecretKey | String | No | Clerk secret key (sk_live_*) |
| Origins | String[] | No | Array of origin URLs to whitelist |
| EnvFilePath | String | No | Path to .env.production file |
| Silent | Switch | No | Suppress verbose output |

### Get-ClerkAllowedOrigins.ps1 Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| SecretKey | String | No | Clerk secret key (sk_live_*) |
| EnvFilePath | String | No | Path to .env.production file |
| Export | Switch | No | Export results to JSON file |
| OutputPath | String | No | Path for exported JSON file |

## Getting Help

### Display Script Help

```powershell
Get-Help .\Add-ClerkAllowedOrigins.ps1 -Full
Get-Help .\Get-ClerkAllowedOrigins.ps1 -Full
```

### View Examples

```powershell
Get-Help .\Add-ClerkAllowedOrigins.ps1 -Examples
```

## Integration with CI/CD

### Example: GitHub Actions

```yaml
name: Update Clerk Allowed Origins

on:
  workflow_dispatch:
    inputs:
      origin_url:
        description: 'Origin URL to whitelist'
        required: true

jobs:
  update-clerk:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3

      - name: Add Allowed Origin
        shell: pwsh
        run: |
          cd documentation/clerk_authentication
          .\Add-ClerkAllowedOrigins.ps1 `
            -SecretKey "${{ secrets.CLERK_SECRET_KEY }}" `
            -Origins @("${{ github.event.inputs.origin_url }}") `
            -Silent
```

### Example: Azure DevOps Pipeline

```yaml
steps:
  - task: PowerShell@2
    displayName: 'Update Clerk Allowed Origins'
    inputs:
      targetType: 'filePath'
      filePath: 'documentation/clerk_authentication/Add-ClerkAllowedOrigins.ps1'
      arguments: '-SecretKey $(ClerkSecretKey) -Origins @("$(OriginUrl)")'
```

## FAQ

### Q: Can I whitelist wildcard domains?
**A:** No, Clerk requires exact domain matches for security. You must list each subdomain separately.

### Q: How many origins can I whitelist?
**A:** There's no documented limit, but keep the list manageable for security and maintenance.

### Q: Do I need to restart my application after updating origins?
**A:** No, Clerk configuration is server-side. Changes propagate automatically within 2-5 minutes.

### Q: Can I use these scripts on Linux/macOS?
**A:** Yes, if you have PowerShell Core 7+ installed. The scripts are cross-platform.

### Q: What's the difference between allowed_origins and authorizedParties?
**A:**
- `allowed_origins`: Clerk server-side CORS configuration (set via API)
- `authorizedParties`: Application-level validation (set in your middleware code)

Both should be configured for maximum security.

## Support

For issues with these scripts:
1. Check the Troubleshooting section above
2. Run with verbose output to see detailed error messages
3. Verify your Clerk secret key is valid
4. Check Clerk API status at status.clerk.com

For Clerk-specific issues:
- Clerk Documentation: https://clerk.com/docs
- Clerk Support: https://clerk.com/support
- Clerk Discord: https://clerk.com/discord

## Version History

- v1.0.0 (2025-01-21): Initial release
  - Add-ClerkAllowedOrigins.ps1: Whitelist domains
  - Get-ClerkAllowedOrigins.ps1: View current configuration
  - Full documentation and examples

## License

These scripts are provided as-is for use with your Clerk authentication configuration.
