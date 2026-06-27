#!/usr/bin/env python3
"""
Script to fix INSERT statements by removing columns that no longer exist:
- settlement_batch_id
- platform_invoice_id
- manual_payment_reference
"""

import re
import sys

def fix_insert_statement(sql_line):
    """
    Remove the three removed columns from INSERT statements.
    """
    # Pattern to match INSERT INTO with column list
    # We need to remove: settlement_batch_id, platform_invoice_id, manual_payment_reference

    # First, remove these columns from the column list
    sql_line = re.sub(
        r',\s*settlement_batch_id\s*,',
        ',',
        sql_line,
        flags=re.IGNORECASE
    )
    sql_line = re.sub(
        r',\s*platform_invoice_id\s*,',
        ',',
        sql_line,
        flags=re.IGNORECASE
    )
    sql_line = re.sub(
        r',\s*manual_payment_reference\s*\)',
        ')',
        sql_line,
        flags=re.IGNORECASE
    )

    # Remove trailing comma before settlement_batch_id
    sql_line = re.sub(
        r',\s*settlement_batch_id\s*\)',
        ')',
        sql_line,
        flags=re.IGNORECASE
    )

    # Now remove the corresponding values (last 3 NULL values before closing parenthesis)
    # Pattern: match the last 3 NULL values separated by commas before the closing paren
    # This is tricky because we need to match the VALUES clause

    # Match: ..., NULL, NULL, NULL);
    # Replace with: ...);
    sql_line = re.sub(
        r',\s*NULL\s*,\s*NULL\s*,\s*NULL\s*\);',
        ');',
        sql_line,
        flags=re.IGNORECASE
    )

    return sql_line

def process_sql_file(input_file, output_file):
    """
    Process a SQL file and fix all INSERT statements.
    """
    with open(input_file, 'r', encoding='utf-8') as f_in:
        lines = f_in.readlines()

    fixed_lines = []
    for line in lines:
        if 'INSERT INTO' in line.upper():
            fixed_line = fix_insert_statement(line)
            fixed_lines.append(fixed_line)
        else:
            fixed_lines.append(line)

    with open(output_file, 'w', encoding='utf-8') as f_out:
        f_out.writelines(fixed_lines)

    print(f"Processed {len([l for l in lines if 'INSERT INTO' in l.upper()])} INSERT statements")
    print(f"Output written to: {output_file}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python fix_insert_statements.py <input_file.sql> [output_file.sql]")
        print("\nExample:")
        print("  python fix_insert_statements.py original_inserts.sql corrected_inserts.sql")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else input_file.replace('.sql', '_fixed.sql')

    try:
        process_sql_file(input_file, output_file)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)



