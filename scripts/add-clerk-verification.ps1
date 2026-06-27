# PowerShell script to add Clerk verification CNAME

$HOSTED_ZONE_ID = "Z0478253VJVESPY8V1ZT"

# IMPORTANT: Replace these with the EXACT values from Clerk Dashboard
# Example: _clerk.preview.adwiise.com or similar
$CLERK_VERIFICATION_NAME = "_clerk.preview.adwiise.com"

# Example: verify.clerk.services or similar
$CLERK_VERIFICATION_VALUE = "verify.clerk.services"

Write-Host "⚠️  IMPORTANT: Update this script with values from Clerk Dashboard!" -ForegroundColor Red
Write-Host ""
Write-Host "Adding Clerk verification CNAME:" -ForegroundColor Yellow
Write-Host "  Name: $CLERK_VERIFICATION_NAME"
Write-Host "  Value: $CLERK_VERIFICATION_VALUE"
Write-Host ""

$confirmation = Read-Host "Have you updated the values above from Clerk Dashboard? (yes/no)"

if ($confirmation -ne "yes") {
    Write-Host "❌ Please update the script with values from Clerk Dashboard first!" -ForegroundColor Red
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
    aws route53 change-resource-record-sets --hosted-zone-id $HOSTED_ZONE_ID --change-batch $changesBatch

    Write-Host ""
    Write-Host "✅ Clerk verification CNAME created!" -ForegroundColor Green
    Write-Host "Note: Verification may take 2-10 minutes" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Go back to Clerk Dashboard and click 'Verify domain'" -ForegroundColor Yellow
}
catch {
    Write-Host "❌ Error creating DNS record: $_" -ForegroundColor Red
}
