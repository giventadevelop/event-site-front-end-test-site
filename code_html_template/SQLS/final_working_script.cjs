const fs = require('fs');

const INPUT_FILE = 'dump-giventa_event_management-202506240024_pre_tenant_id_with_insert_data.sql';
const OUTPUT_FILE = 'dump-giventa_event_management-202506240024_pre_tenant_id_with_insert_data.ordered.sql';

const TABLE_ORDER = [
  'event_type_details',
  'user_profile',
  'event_details',
  'event_guest_pricing',
  'event_admin',
  'event_admin_audit_log',
  'event_attendee',
  'event_attendee_guest',
  'event_calendar_entry',
  'event_live_update',
  'event_live_update_attachment',
  'event_media',
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
  'event_contacts',
  'event_emails',
  'event_featured_performers',
  'event_program_directors',
  'event_sponsors',
  'event_sponsors_join',
  'executive_committee_team_members',
  'bulk_operation_log',
  'databasechangelog',
  'databasechangeloglock',
];

function extractInsertStatements(content) {
  const statements = [];
  const lines = content.split('\n');

  let currentStatement = '';
  let inStatement = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('INSERT INTO public.')) {
      if (currentStatement.trim()) {
        statements.push(currentStatement.trim());
      }
      currentStatement = line;
      inStatement = true;
    } else if (inStatement) {
      currentStatement += '\n' + line;
      if (line.trim().endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
        inStatement = false;
      }
    }
  }

  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }

  return statements;
}

function main() {
  // Read the input file
  const content = fs.readFileSync(INPUT_FILE, 'utf8');

  // Extract all INSERT statements
  const statements = extractInsertStatements(content);

  // Group by table
  const tableGroups = {};

  for (const statement of statements) {
    const match = statement.match(/^INSERT INTO public\.([a-zA-Z0-9_]+) /);
    if (match) {
      const tableName = match[1];
      if (!tableGroups[tableName]) {
        tableGroups[tableName] = [];
      }
      tableGroups[tableName].push(statement);
    }
  }

  // Build output in correct order
  let output = [];

  // Add tables in specified order
  for (const tableName of TABLE_ORDER) {
    if (tableGroups[tableName]) {
      output = output.concat(tableGroups[tableName]);
    }
  }

  // Add any remaining tables
  const allTables = Object.keys(tableGroups);
  const remainingTables = allTables.filter(t => !TABLE_ORDER.includes(t));

  for (const tableName of remainingTables) {
    if (tableGroups[tableName]) {
      output = output.concat(tableGroups[tableName]);
    }
  }

  // Write output
  const finalContent = output.join('\n\n') + '\n';
  fs.writeFileSync(OUTPUT_FILE, finalContent, 'utf8');
}

main();



























