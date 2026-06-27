# SQL Insert Reordering and PostgreSQL Dump Guide

> **Sequence / ID alignment (allocationSize, sync scripts, backends):** see
> [`documentation/database_export_import/SEQUENCE_ID_ALIGNMENT_GUIDE.html`](database_export_import/SEQUENCE_ID_ALIGNMENT_GUIDE.html)
> and `.cursor/rules/sequence_id_alignment_and_import.mdc`.

> **Full workflow (reorder, renumber, PROD IDs, batch import, sequence sync):** see
> [`documentation/database_export_import/DATABASE_EXPORT_IMPORT_GUIDE.html`](database_export_import/DATABASE_EXPORT_IMPORT_GUIDE.html)
> — especially **§3a** (renumber IDs + trim Spring Batch) and **§11** (sequence fix reference).

This guide covers how to reorder SQL INSERT statements and how to export/import PostgreSQL databases using `pg_dump`.

---

## ⚡ Priority: Quick Start Workflow

### Step-by-Step Instructions

**1. Navigate to the SQLS folder:**

```bash
cd E:\project_workspace\mosc-temp\code_html_template\SQLS
```

**2. Find the PostgreSQL container ID:**

```bash
docker ps | findstr postgres
```

This will output something like:
```
0c2a38241eca   postgres:15   "docker-entrypoint.s…"   2 weeks ago   Up 2 weeks   0.0.0.0:5432->5432/tcp   postgres_container
```

Copy the container ID (e.g., `0c2a38241eca`).

**3. Export database data with INSERT statements:**

```bash
docker exec -it 0c2a38241eca pg_dump -U event_site_app -d event_site_manager_db --data-only --column-inserts > corrected_event_media_inserts_TMP.sql
```

**Important**: Replace `0c2a38241eca` with your actual container ID from step 2.

**4. Reorder the INSERT statements:**

Still in the `code_html_template/SQLS` folder, run:

```bash
node reorder_sql_inserts_final.cjs
```

This will generate: `corrected_event_media_inserts.ordered_TMP.sql`

**5. Import the reordered data:**

Run the generated SQL file to insert data records into the database tables:

```bash
# Using docker exec with psql
docker exec -i 0c2a38241eca psql -U event_site_app -d event_site_manager_db < corrected_event_media_inserts.ordered_TMP.sql

# Or using docker-compose (if applicable)
docker-compose exec -T postgresql psql -U event_site_app -d event_site_manager_db < corrected_event_media_inserts.ordered_TMP.sql
```

### Summary

1. ✅ Navigate to `code_html_template/SQLS`
2. ✅ Get PostgreSQL container ID: `docker ps | findstr postgres`
3. ✅ Export data: `docker exec -it <container_id> pg_dump -U event_site_app -d event_site_manager_db --data-only --column-inserts > corrected_event_media_inserts_TMP.sql`
4. ✅ Reorder INSERTs: `node reorder_sql_inserts_final.cjs`
5. ✅ Import data: Run `corrected_event_media_inserts.ordered_TMP.sql` into the database

---

## Table of Contents

1. [SQL Insert Reordering Script](#sql-insert-reordering-script)
2. [Optional: Renumber IDs and trim Spring Batch](#optional-renumber-ids-and-trim-spring-batch)
3. [PostgreSQL Dump Commands (pg_dump)](#postgresql-dump-commands-pg_dump)
4. [Common Use Cases](#common-use-cases)

---

## Optional: Renumber IDs and trim Spring Batch

After reordering, you may still have **high tenant-specific primary keys** (e.g. MOSC `600001+`) and **thousands of Spring Batch rows**. Use:

```bash
cd code_html_template/SQLS/sequence_fix_inserts
node renumber_sql_insert_ids.cjs --batch-executions=3 --batch-logs=3
```

**Output:** `corrected_event_media_inserts.renumbered.sql` (does not overwrite `SQLS/corrected_event_media_inserts.ordered.sql`).

**Also run after import:** `Current_Sqls/sync_sequence_after_inserts.sql` and `Current_Sqls/sync_spring_batch_sequences.sql`.

Details: [DATABASE_EXPORT_IMPORT_GUIDE.html](database_export_import/DATABASE_EXPORT_IMPORT_GUIDE.html) §3a and §11.

---

## SQL Insert Reordering Script

### Overview

The SQL insert reordering script (`reorder_sql_inserts_final.cjs`) is a Node.js utility that reorganizes INSERT statements in SQL dump files according to a predefined table order. This ensures proper execution order when restoring databases, preventing foreign key constraint violations.

### Location

**Script Path**: `code_html_template/SQLS/reorder_sql_inserts_final.cjs`

### Final Script Version

**Recommended Version**: `reorder_sql_inserts_final.cjs`

This is the most up-to-date and reliable version because:
- ✅ Handles multi-line INSERT statements properly
- ✅ Includes complete table ordering for all database tables
- ✅ Handles edge cases (missing semicolons, extra tables)
- ✅ Properly groups statements by table name

### How It Works

1. **Reads** all INSERT statements from the input file
2. **Parses** complete INSERT statements (including multi-line ones)
3. **Groups** INSERT statements by table name
4. **Reorders** them according to the `TABLE_ORDER` array (lines 7-45)
5. **Writes** the reordered SQL to the output file

### Table Order

The script uses a predefined order that respects foreign key dependencies:

```javascript
const TABLE_ORDER = [
  'event_type_details',        // Base reference data
  'user_profile',             // User data
  'event_details',            // Event data
  'event_guest_pricing',
  'event_admin',
  'event_admin_audit_log',
  'event_attendee',           // Depends on events and users
  'event_attendee_guest',     // Depends on attendees
  'event_calendar_entry',
  'event_live_update',
  'event_live_update_attachment',
  'event_media',              // Depends on events
  'event_organizer',
  'event_poll',
  'event_poll_option',
  'event_poll_response',
  'event_score_card',
  'event_score_card_detail',
  'discount_code',
  'event_ticket_type',
  'event_ticket_transaction',
  'qr_code_usage',
  'rel_event_detailsdiscount_codes',
  'tenant_organization',
  'tenant_settings',
  'user_payment_transaction',
  'user_subscription',
  'user_task',
  'event_contacts',           // Event-related data
  'event_emails',
  'event_featured_performers',
  'event_program_directors',
  'event_sponsors',
  'event_sponsors_join',
  'executive_committee_team_members',
  'bulk_operation_log',       // Metadata tables (last)
  'databasechangelog',
  'databasechangeloglock',
];
```

### Usage

#### Default Configuration

The script is pre-configured to use:
- **Input File**: `corrected_event_media_inserts_TMP.sql` (in the same directory as the script)
- **Output File**: `corrected_event_media_inserts.ordered_TMP.sql` (in the same directory as the script)

#### Step 1: Run the Script

**Option A: From the project root directory:**

```bash
node code_html_template/SQLS/reorder_sql_inserts_final.cjs
```

**Option B: From the `code_html_template/SQLS` directory:**

```bash
cd code_html_template/SQLS
node reorder_sql_inserts_final.cjs
```

**Important**: If you're already in the `code_html_template/SQLS` directory, use just the filename (`reorder_sql_inserts_final.cjs`), not the full path. Using the full path when already in that directory will cause a path resolution error.

#### Step 2: Using a Different Input File

If you want to use a different input file, edit the script:

```javascript
const INPUT_FILE = path.join(SCRIPT_DIR, 'your_file.sql');
const OUTPUT_FILE = path.join(SCRIPT_DIR, 'your_file.ordered.sql');
```

**Note**: The script uses `path.join(__dirname, ...)` to ensure it always looks for files in the script's directory, regardless of where you run the command from.

#### Step 3: Check Output

The script will create the output file with reordered INSERT statements. The output file will have:
- INSERT statements grouped by table
- Tables in dependency order
- Extra tables (not in TABLE_ORDER) placed before metadata tables
- Statements separated by blank lines

### Example: Using with `corrected_event_media_inserts_TMP.sql`

The script is pre-configured to use `corrected_event_media_inserts_TMP.sql` as the default input file.

1. **Run the script** (from project root):
   ```bash
   node code_html_template/SQLS/reorder_sql_inserts_final.cjs
   ```

2. **Expected output**:
   ```
   📁 Reading input file: E:\project_workspace\mosc-temp\code_html_template\SQLS\corrected_event_media_inserts_TMP.sql
   ✅ Success! Output written to: E:\project_workspace\mosc-temp\code_html_template\SQLS\corrected_event_media_inserts.ordered_TMP.sql
   📊 Summary:
      • Total INSERT statements: [number]
      • Tables found: [table names]
      • Extra tables (not in order): none
   ```

3. **Result**: The output file will contain all INSERT statements reordered according to the `TABLE_ORDER` array. Tables that are already in the correct position will remain in place, and any tables not in the order list will be placed before metadata tables.

### Error Handling

If the input file doesn't exist, the script will show a clear error message:

```
❌ Error: Input file not found: [path]
   Please ensure the file exists in the same directory as this script.
```

### Notes

- The script preserves all INSERT statements exactly as they appear
- Multi-line INSERT statements are handled correctly
- Tables not in `TABLE_ORDER` are placed before metadata tables (`bulk_operation_log`, `databasechangelog`, `databasechangeloglock`)
- If a table has no INSERT statements, it's skipped in the output

---

## PostgreSQL Dump Commands (pg_dump)

### Overview

PostgreSQL's `pg_dump` is a utility for backing up a PostgreSQL database. It creates a file containing SQL commands that can be used to recreate the database.

### Basic pg_dump Syntax

```bash
pg_dump [connection-option...] [option...] [dbname]
```

### Connection Options

```bash
# Using username and database
pg_dump -U username -d database_name

# Using host and port
pg_dump -h localhost -p 5432 -U username -d database_name

# Using connection string
pg_dump "postgresql://username:password@localhost:5432/database_name"
```

### Common pg_dump Options

#### 1. Schema Only (No Data)

```bash
pg_dump -U username -d database_name --schema-only > schema_only.sql
```

#### 2. Data Only (No Schema)

```bash
pg_dump -U username -d database_name --data-only > data_only.sql
```

#### 3. INSERT Statements Format

```bash
pg_dump -U username -d database_name --column-inserts > dump_with_inserts.sql
```

#### 4. Custom Format (Recommended for Large Databases)

```bash
pg_dump -U username -d database_name -F c -f dump_file.dump
```

#### 5. Specific Tables

```bash
pg_dump -U username -d database_name -t table_name1 -t table_name2 > specific_tables.sql
```

#### 6. Exclude Tables

```bash
pg_dump -U username -d database_name -T table_name1 -T table_name2 > dump_without_tables.sql
```

#### 7. Include CREATE DATABASE Statement

```bash
pg_dump -U username -d database_name --create > dump_with_create_db.sql
```

#### 8. No Owner Information

```bash
pg_dump -U username -d database_name --no-owner > dump_no_owner.sql
```

#### 9. No Privileges

```bash
pg_dump -U username -d database_name --no-privileges > dump_no_privileges.sql
```

### Complete Dump Examples

#### Example 1: Full Database Dump (Plain SQL)

```bash
# Basic dump with all data and schema
pg_dump -U giventa_user -d giventa_event_management > full_dump.sql

# With host and port
pg_dump -h localhost -p 5432 -U giventa_user -d giventa_event_management > full_dump.sql

# With password prompt
pg_dump -U giventa_user -d giventa_event_management -W > full_dump.sql
```

#### Example 2: Dump with INSERT Statements (Ready for Reordering)

```bash
# Creates INSERT statements instead of COPY commands
pg_dump -U giventa_user -d giventa_event_management \
  --column-inserts \
  --data-only \
  > dump_with_inserts.sql
```

#### Example 3: Schema + Data with INSERT Format

```bash
# Full dump with INSERT statements
pg_dump -U giventa_user -d giventa_event_management \
  --column-inserts \
  > dump_full_with_inserts.sql
```

#### Example 4: Custom Format (Binary)

```bash
# Custom format (can be compressed)
pg_dump -U giventa_user -d giventa_event_management \
  -F c \
  -f dump_custom.dump

# Restore custom format
pg_restore -U giventa_user -d new_database -c dump_custom.dump
```

### Docker-Based pg_dump Commands

If your database is running in Docker:

#### From Host Machine

```bash
# Using docker exec
docker exec -it container_name pg_dump -U username -d database_name > dump.sql

# Using docker-compose
docker-compose exec postgresql pg_dump -U username -d database_name > dump.sql
```

#### From Inside Container

```bash
# Connect to container
docker exec -it container_name bash

# Run pg_dump
pg_dump -U username -d database_name > /tmp/dump.sql

# Copy file out
docker cp container_name:/tmp/dump.sql ./dump.sql
```

### Example: Docker Compose Setup

Based on the project's Docker setup (see `src/main/docker/Docker_Local/README.md`):

```bash
# Backup database
docker-compose -f docker-compose.local.yml exec postgresql \
  pg_dump -U malayalees_user malayalees_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup with INSERT statements
docker-compose -f docker-compose.local.yml exec postgresql \
  pg_dump -U malayalees_user malayalees_db \
  --column-inserts \
  > backup_with_inserts_$(date +%Y%m%d_%H%M%S).sql

# Backup schema only
docker-compose -f docker-compose.local.yml exec postgresql \
  pg_dump -U malayalees_user malayalees_db \
  --schema-only \
  > schema_only_$(date +%Y%m%d_%H%M%S).sql

# Backup data only with INSERT statements
docker-compose -f docker-compose.local.yml exec postgresql \
  pg_dump -U malayalees_user malayalees_db \
  --data-only \
  --column-inserts \
  > data_only_inserts_$(date +%Y%m%d_%H%M%S).sql
```

### Restoring Database from Dump

#### Plain SQL Format

```bash
# Using psql
psql -U username -d database_name < dump.sql

# Using docker
docker-compose exec -T postgresql psql -U username -d database_name < dump.sql
```

#### Custom Format

```bash
# Using pg_restore
pg_restore -U username -d database_name -c dump.dump

# Clean restore (drop existing objects first)
pg_restore -U username -d database_name -c --if-exists dump.dump
```

### Useful pg_dump Options Summary

| Option | Description |
|--------|-------------|
| `--schema-only` | Dump only the schema (no data) |
| `--data-only` | Dump only the data (no schema) |
| `--column-inserts` | Use INSERT statements instead of COPY |
| `--inserts` | Use INSERT statements (not column-specific) |
| `--create` | Include CREATE DATABASE statement |
| `--no-owner` | Don't output commands to set ownership |
| `--no-privileges` | Don't output commands to set privileges |
| `-F c` | Custom format (compressed binary) |
| `-F p` | Plain text format (default) |
| `-F t` | Tar format |
| `-f file` | Output file |
| `-t table` | Dump specific table |
| `-T table` | Exclude specific table |
| `-n schema` | Dump specific schema |
| `-N schema` | Exclude specific schema |
| `-v` | Verbose mode |
| `-W` | Prompt for password |

---

## Common Use Cases

### Use Case 1: Create Reordered INSERT Statements for Data Migration

**Scenario**: You need to migrate data from one database to another, but the INSERT statements need to be in dependency order.

**Steps**:

1. **Export data with INSERT statements**:
   ```bash
   pg_dump -U username -d source_database \
     --data-only \
     --column-inserts \
     > data_inserts.sql
   ```

2. **Reorder the INSERT statements**:
   - Update `reorder_sql_inserts_final.cjs` to use `data_inserts.sql` as input
   - Run the script
   - Use the output file for import

3. **Import to target database**:
   ```bash
   psql -U username -d target_database < data_inserts.ordered.sql
   ```

### Use Case 2: Backup Specific Tables

**Scenario**: You only need to backup specific tables (e.g., `event_media`).

```bash
pg_dump -U username -d database_name \
  -t event_media \
  --column-inserts \
  > event_media_inserts.sql
```

### Use Case 3: Export Schema for New Database Setup

**Scenario**: Setting up a new database with the same schema.

```bash
# Export schema only
pg_dump -U username -d source_database \
  --schema-only \
  > schema.sql

# Create new database and import schema
createdb -U username new_database
psql -U username -d new_database < schema.sql
```

### Use Case 4: Create Clean INSERT Statements File

**Scenario**: You need a clean INSERT-only file for data seeding.

```bash
pg_dump -U username -d database_name \
  --data-only \
  --column-inserts \
  --no-owner \
  --no-privileges \
  > clean_inserts.sql

# Then reorder if needed
node reorder_sql_inserts_final.cjs
```

### Use Case 5: Backup and Restore in Docker Environment

**Scenario**: Full backup and restore in Docker Compose setup.

```bash
# Backup
docker-compose exec postgresql \
  pg_dump -U malayalees_user malayalees_db \
  > backup_$(date +%Y%m%d).sql

# Restore
docker-compose exec -T postgresql \
  psql -U malayalees_user malayalees_db \
  < backup_20250103.sql
```

---

## Troubleshooting

### Issue: Foreign Key Constraint Violations

**Problem**: When importing data, you get foreign key constraint violations.

**Solution**:
1. Use the reordering script to ensure proper dependency order
2. Or temporarily disable triggers:
   ```sql
   SET session_replication_role = 'replica';
   -- Import data
   SET session_replication_role = 'origin';
   ```

### Issue: Script Doesn't Handle Multi-line INSERTs

**Problem**: The script is not parsing multi-line INSERT statements correctly.

**Solution**: Use `reorder_sql_inserts_final.cjs` which properly handles multi-line statements.

### Issue: Missing Tables in Output

**Problem**: Some tables are missing from the reordered output.

**Solution**: Check if the tables are in the `TABLE_ORDER` array. If not, they should appear before metadata tables. If they're still missing, check the input file format.

### Issue: pg_dump Connection Errors

**Problem**: Cannot connect to database.

**Solution**:
- Check database is running
- Verify credentials
- Check network connectivity
- For Docker: Ensure container is running and port is accessible

---

## Related Files

- **Script**: `code_html_template/SQLS/reorder_sql_inserts_final.cjs`
- **Schema File**: `code_html_template/SQLS/db_SQL_Temp_ VER_1.sql`
- **Example INSERT File**: `code_html_template/SQLS/corrected_event_media_inserts_TMP.sql`
- **Docker Compose**: `src/main/docker/Docker_Local/docker-compose.local.yml`

---

## Additional Resources

- [PostgreSQL pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)
- [PostgreSQL pg_restore Documentation](https://www.postgresql.org/docs/current/app-pgrestore.html)
- [Node.js File System Documentation](https://nodejs.org/api/fs.html)

---

**Last Updated**: 2025-01-03
**Version**: 1.0

