# PowerShell script to add Clerk verification CNAME for www.mosc-temp.com

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Add Clerk Verification CNAME for www.mosc-temp.com" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  PREREQUISITE: You must first add www.mosc-temp.com as a satellite domain in Clerk Dashboard" -ForegroundColor Yellow
Write-Host ""
Write-Host "Steps:" -ForegroundColor Yellow
Write-Host "  1. Go to: https://dashboard.clerk.com/"
Write-Host "  2. Configure → Domains → Satellite domains"
Write-Host "  3. Add satellite domain: www.mosc-temp.com"
Write-Host "  4. Choose: DNS verification"
Write-Host "  5. Copy the CNAME values Clerk provides"
Write-Host ""

$HOSTED_ZONE_ID = Read-Host "Enter the Route53 Hosted Zone ID for mosc-temp.com"

if ([string]::IsNullOrWhiteSpace($HOSTED_ZONE_ID)) {
    Write-Host "❌ Hosted Zone ID is required!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Enter the EXACT values from Clerk Dashboard:" -ForegroundColor Yellow
Write-Host ""

$CLERK_VERIFICATION_NAME = Read-Host "CNAME Name (e.g., _clerk.www.mosc-temp.com)"
$CLERK_VERIFICATION_VALUE = Read-Host "CNAME Value (e.g., verify.clerk.services)"

if ([string]::IsNullOrWhiteSpace($CLERK_VERIFICATION_NAME) -or [string]::IsNullOrWhiteSpace($CLERK_VERIFICATION_VALUE)) {
    Write-Host "❌ Both CNAME name and value are required!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Hosted Zone: $HOSTED_ZONE_ID"
Write-Host "  CNAME Name: $CLERK_VERIFICATION_NAME"
Write-Host "  CNAME Value: $CLERK_VERIFICATION_VALUE"
Write-Host ""

$confirmation = Read-Host "Are these values correct? (yes/no)"

if ($confirmation -ne "yes") {
    Write-Host "❌ Cancelled" -ForegroundColor Red
    exit
}

$changesBatch = @"
{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "$CLERK_VERIFICATION_NAME",
      "Type": "CNAME",
      "TTL": 300,
      "ResourceRecords": [{"Value": "$CLERK_VERIFICATION_VALUE"}]
    }
  }]
}
"@

try {
    Write-Host ""
    Write-Host "Creating Clerk verification CNAME..." -ForegroundColor Yellow

    aws route53 change-resource-record-sets --hosted-zone-id $HOSTED_ZONE_ID --change-batch $changesBatch

    Write-Host ""
    Write-Host "✅ Clerk verification CNAME created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Wait 2-10 minutes for DNS propagation"
    Write-Host "  2. Go back to Clerk Dashboard"
    Write-Host "  3. Click 'Verify domain' button"
    Write-Host "  4. Wait for green checkmark 'Verified' status"
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "❌ Error creating DNS record: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - Check that the hosted zone ID is correct"
    Write-Host "  - Verify the CNAME values match Clerk Dashboard exactly"
    Write-Host "  - Make sure the record doesn't already exist"
}
