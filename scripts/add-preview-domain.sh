#!/bin/bash
# Add preview.adwiise.com CNAME for AWS Amplify custom domain

# Your hosted zone ID
HOSTED_ZONE_ID="Z0478253VJVESPY8V1ZT"

# IMPORTANT: Replace this with the actual value from AWS Amplify Console
AMPLIFY_DOMAIN="feature-common-clerk.d1508w3f27cyps.amplifyapp.com"

echo "Adding preview.adwiise.com → $AMPLIFY_DOMAIN"

aws route53 change-resource-record-sets --hosted-zone-id $HOSTED_ZONE_ID --change-batch '{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "preview.adwiise.com",
      "Type": "CNAME",
      "TTL": 300,
      "ResourceRecords": [{"Value": "'$AMPLIFY_DOMAIN'"}]
    }
  }]
}'

echo ""
echo "✅ DNS record created!"
echo "Note: DNS propagation may take 5-30 minutes"
echo ""
echo "To verify DNS:"
echo "  nslookup preview.adwiise.com"
