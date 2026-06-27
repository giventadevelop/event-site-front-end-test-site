# PowerShell script to add preview.adwiise.com CNAME for AWS Amplify custom domain

$HOSTED_ZONE_ID = "Z0478253VJVESPY8V1ZT"

# IMPORTANT: Replace this with the actual value from AWS Amplify Console
# It will look like: feature-common-clerk.d1508w3f27cyps.amplifyapp.com
$AMPLIFY_DOMAIN = "feature-common-clerk.d1508w3f27cyps.amplifyapp.com"

Write-Host "Adding preview.adwiise.com → $AMPLIFY_DOMAIN" -ForegroundColor Yellow

$changesBatch = @"
{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "preview.adwiise.com",
      "Type": "CNAME",
      "TTL": 300,
      "ResourceRecords": [{"Value": "$AMPLIFY_DOMAIN"}]
    }
  }]
}
"@

try {
    aws route53 change-resource-record-sets --hosted-zone-id $HOSTED_ZONE_ID --change-batch $changesBatch

    Write-Host ""
    Write-Host "✅ DNS record created!" -ForegroundColor Green
    Write-Host "Note: DNS propagation may take 5-30 minutes" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To verify DNS:" -ForegroundColor Yellow
    Write-Host "  nslookup preview.adwiise.com"
}
catch {
    Write-Host "❌ Error creating DNS record: $_" -ForegroundColor Red
}
