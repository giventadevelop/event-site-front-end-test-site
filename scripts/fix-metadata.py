#!/usr/bin/env python3
"""
Fix metadata syntax errors by converting single quotes to double quotes
in Next.js metadata objects.
"""

import os
import re
from pathlib import Path

def fix_metadata_file(filepath):
    """Fix metadata syntax in a single file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if file has metadata export
        if 'export const metadata' not in content:
            return False

        original_content = content

        # Fix metadata block: Replace single quotes with double quotes
        # Pattern: Find metadata object and replace quotes within it
        def fix_metadata_quotes(match):
            metadata_block = match.group(0)
            # Replace single quotes with double quotes for title and description
            fixed_block = re.sub(r"title: '([^']*)'", r'title: "\1"', metadata_block)
            fixed_block = re.sub(r"description: '([^']*)'", r'description: "\1"', fixed_block)
            return fixed_block

        # Match metadata export block
        pattern = r'export const metadata = \{[^}]*\};'
        content = re.sub(pattern, fix_metadata_quotes, content, flags=re.DOTALL)

        # Write back if changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ Fixed: {filepath}")
            return True

        return False

    except Exception as e:
        print(f"✗ Error processing {filepath}: {e}")
        return False

def main():
    """Find and fix all TypeScript files with metadata."""
    print("Starting metadata syntax fix...")

    src_path = Path('src')
    if not src_path.exists():
        print("Error: src directory not found!")
        return 1

    fixed_count = 0

    # Find all .tsx and .ts files
    for tsx_file in src_path.rglob('*.tsx'):
        if fix_metadata_file(tsx_file):
            fixed_count += 1

    for ts_file in src_path.rglob('*.ts'):
        if fix_metadata_file(ts_file):
            fixed_count += 1

    print(f"\n✓ Fixed {fixed_count} file(s)")
    return 0

if __name__ == '__main__':
    exit(main())
