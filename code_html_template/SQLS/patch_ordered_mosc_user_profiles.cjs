#!/usr/bin/env node
/**
 * @deprecated Replaced by sequence_fix_inserts/renumber_sql_insert_ids.cjs (batch step 2b).
 * This script previously re-injected MOSC user_profile rows with +600000 IDs, which caused
 * sequence_generator to jump to 610k+ after every /FORCE import.
 *
 * Kept as a no-op so old docs/scripts that invoke it do not fail.
 */
console.warn(
  'DEPRECATED: patch_ordered_mosc_user_profiles.cjs is a no-op. Use renumber_sql_insert_ids.cjs via database_export_import_refresh.bat step 2b.',
);
process.exit(0);
