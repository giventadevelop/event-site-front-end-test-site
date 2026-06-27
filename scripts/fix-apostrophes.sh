#!/bin/bash
# Fix apostrophes in metadata by converting single quotes to double quotes

echo "Fixing metadata apostrophe syntax errors..."

find src/app -type f -name "*.tsx" | while read file; do
  if grep -q "export const metadata" "$file"; then
    echo "Processing $file..."
    # Fix title lines
    sed -i "s/title: '\([^']*\)'/title: \"\1\"/g" "$file"
    # Fix description lines
    sed -i "s/description: '\([^']*\)'/description: \"\1\"/g" "$file"
  fi
done

echo "✓ Metadata syntax fixed"
