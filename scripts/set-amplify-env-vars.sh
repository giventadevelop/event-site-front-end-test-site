#!/bin/bash
# Script to set AWS Amplify environment variables in bulk
# Usage: ./scripts/set-amplify-env-vars.sh [env-file] [branch-name] [app-id] [region]
# Examples:
#   ./scripts/set-amplify-env-vars.sh .env.production
#   ./scripts/set-amplify-env-vars.sh .env.development feature_Common_Clerk
#   ./scripts/set-amplify-env-vars.sh .env.amplify main d1508w3f27cyps us-east-1

set -e

ENV_FILE="${1:-.env.amplify}"
BRANCH_NAME="${2:-feature_Common_Clerk}"
APP_ID="${3:-d1508w3f27cyps}"
REGION="${4:-us-east-1}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ jq is not installed. Please install it first."
    echo "   https://stedolan.github.io/jq/download/"
    exit 1
fi

# Check if env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Environment file '$ENV_FILE' not found!"
    echo "   Available .env files:"
    ls -1 .env* 2>/dev/null || echo "   No .env files found"
    exit 1
fi

echo "🚀 Setting up environment variables for Amplify app"
echo "   App ID: $APP_ID"
echo "   Branch: $BRANCH_NAME"
echo "   Region: $REGION"
echo "   Env File: $ENV_FILE"
echo ""

# Read the .env file and convert to JSON format for AWS CLI
ENV_VARS="{}"

while IFS= read -r line; do
    # Trim leading/trailing whitespace
    line=$(echo "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

    # Skip empty lines
    [[ -z "$line" ]] && continue

    # Skip comment lines (lines starting with #)
    [[ "$line" =~ ^#.* ]] && continue

    # Check if line contains '='
    if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"

        # Trim whitespace from key
        key=$(echo "$key" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

        # Remove inline comments from value (everything after # not in quotes)
        # This is a simple approach - handles most cases
        if [[ ! "$value" =~ ^[\"'] ]]; then
            value=$(echo "$value" | sed 's/[[:space:]]*#.*$//')
        fi

        # Trim whitespace from value
        value=$(echo "$value" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

        # Remove surrounding quotes from value if present
        if [[ "$value" =~ ^\"(.*)\"$ ]]; then
            value="${BASH_REMATCH[1]}"
        elif [[ "$value" =~ ^\'(.*)\'$ ]]; then
            value="${BASH_REMATCH[1]}"
        fi

        # Skip if key is empty
        [[ -z "$key" ]] && continue

        # Add to JSON object
        ENV_VARS=$(echo "$ENV_VARS" | jq --arg k "$key" --arg v "$value" '. + {($k): $v}')
    fi
done < "$ENV_FILE"

echo "📋 Environment variables to set:"
echo "$ENV_VARS" | jq 'keys[]'
echo ""

# Check if we have any variables to set
VAR_COUNT=$(echo "$ENV_VARS" | jq 'length')
if [ "$VAR_COUNT" -eq 0 ]; then
    echo "⚠️  No environment variables found in $ENV_FILE"
    echo "   Make sure the file has valid KEY=VALUE pairs"
    exit 1
fi

echo "Found $VAR_COUNT environment variable(s)"
echo ""

# Update Amplify app environment variables
echo "⏳ Updating environment variables..."
aws amplify update-app \
    --app-id "$APP_ID" \
    --environment-variables "$ENV_VARS" \
    --region "$REGION"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Environment variables updated successfully!"
    echo ""
    echo "📝 Note: You may need to redeploy your app for changes to take effect:"
    echo "   aws amplify start-job --app-id $APP_ID --branch-name $BRANCH_NAME --job-type RELEASE --region $REGION"
else
    echo "❌ Failed to update environment variables"
    exit 1
fi
