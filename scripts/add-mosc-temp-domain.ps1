# PowerShell script to add www.mosc-temp.com DNS for AWS Amplify custom domain

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Adding www.mosc-temp.com Custom Domain" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# IMPORTANT: You need to provide the mosc-temp.com hosted zone ID
Write-Host "⚠️  PREREQUISITE: You must have a Route53 hosted zone for mosc-temp.com" -ForegroundColor Yellow
Write-Host ""

$HOSTED_ZONE_ID = Read-Host "Enter the Route53 Hosted Zone ID for mosc-temp.com"

if ([string]::IsNullOrWhiteSpace($HOSTED_ZONE_ID)) {
    Write-Host "❌ Hosted Zone ID is required!" -ForegroundColor Red
    exit
}

# The Amplify domain from your existing app
$AMPLIFY_DOMAIN = "feature-common-clerk.d1508w3f27cyps.amplifyapp.com"

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Domain: www.mosc-temp.com"
Write-Host "  Target: $AMPLIFY_DOMAIN"
Write-Host "  Hosted Zone: $HOSTED_ZONE_ID"
Write-Host ""

$confirmation = Read-Host "Continue with DNS record creation? (yes/no)"

if ($confirmation -ne "yes") {
    Write-Host "❌ Cancelled" -ForegroundColor Red
    exit
}

$changesBatch = @"
{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "www.mosc-temp.com",
      "Type": "CNAME",
      "TTL": 300,
      "ResourceRecords": [{"Value": "$AMPLIFY_DOMAIN"}]
    }
  }]
}
"@

try {
    Write-Host ""
    Write-Host "Creating DNS record..." -ForegroundColor Yellow

    aws route53 change-resource-record-sets --hosted-zone-id $HOSTED_ZONE_ID --change-batch $changesBatch

    Write-Host ""
    Write-Host "✅ DNS record created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Wait 5-30 minutes for DNS propagation"
    Write-Host "  2. Verify DNS: nslookup www.mosc-temp.com"
    Write-Host "  3. Check AWS Amplify Console for domain verification"
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "❌ Error creating DNS record: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - Check that the hosted zone ID is correct"
    Write-Host "  - Verify AWS CLI is configured with correct credentials"
    Write-Host "  - Make sure the record doesn't already exist"
}
