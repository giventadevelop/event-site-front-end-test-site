#!/bin/bash
# Test script to verify env file parsing logic
# Usage: ./scripts/test-env-parsing.sh [env-file]

ENV_FILE="${1:-.env.test}"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Test file '$ENV_FILE' not found!"
    exit 1
fi

echo "🧪 Testing environment variable parsing"
echo "   File: $ENV_FILE"
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ jq is not installed. Please install it first."
    exit 1
fi

ENV_VARS="{}"
LINE_NUM=0

while IFS= read -r line; do
    LINE_NUM=$((LINE_NUM + 1))

    # Trim leading/trailing whitespace
    line=$(echo "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

    # Skip empty lines
    if [[ -z "$line" ]]; then
        echo "Line $LINE_NUM: [SKIP] Empty line"
        continue
    fi

    # Skip comment lines
    if [[ "$line" =~ ^#.* ]]; then
        echo "Line $LINE_NUM: [SKIP] Comment: ${line:0:50}..."
        continue
    fi

    # Check if line contains '='
    if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"

        # Trim whitespace from key
        key=$(echo "$key" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

        # Remove inline comments from value (everything after # not in quotes)
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
        if [[ -z "$key" ]]; then
            echo "Line $LINE_NUM: [SKIP] Empty key"
            continue
        fi

        echo "Line $LINE_NUM: [OK] $key = $value"
        ENV_VARS=$(echo "$ENV_VARS" | jq --arg k "$key" --arg v "$value" '. + {($k): $v}')
    else
        echo "Line $LINE_NUM: [SKIP] No '=' found: $line"
    fi
done < "$ENV_FILE"

echo ""
echo "📊 Summary:"
echo "   Total variables parsed: $(echo "$ENV_VARS" | jq 'length')"
echo ""
echo "📋 Parsed variables (as JSON):"
echo "$ENV_VARS" | jq '.'
