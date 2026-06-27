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

function main() {
  try {
    // Read the input file
    const fileContent = fs.readFileSync(INPUT_FILE, 'utf8');

    // Split by INSERT statements using a more robust approach
    const insertStatements = [];

    // Use regex to split the file content by INSERT statements
    const parts = fileContent.split(/(?=INSERT INTO public\.)/);

    for (const part of parts) {
      if (part.trim() && part.includes('INSERT INTO public.')) {
        // Find the end of this statement (last semicolon)
        const lastSemicolon = part.lastIndexOf(';');
        if (lastSemicolon !== -1) {
          const statement = part.substring(0, lastSemicolon + 1).trim();
          if (statement) {
            insertStatements.push(statement);
          }
        }
      }
    }

    // Group statements by table
    const tableInserts = {};

    for (const statement of insertStatements) {
      const match = statement.match(/^INSERT INTO public\.([a-zA-Z0-9_]+) /);
      if (match) {
        const tableName = match[1];
        if (!tableInserts[tableName]) {
          tableInserts[tableName] = [];
        }
        tableInserts[tableName].push(statement);
      }
    }

    // Build output in the correct order
    let output = [];

    // Add tables in the specified order
    for (const tableName of TABLE_ORDER) {
      if (tableInserts[tableName]) {
        output = output.concat(tableInserts[tableName]);
      }
    }

    // Add any tables not in the order list (before metadata tables)
    const allTables = Object.keys(tableInserts);
    const extraTables = allTables.filter(t => !TABLE_ORDER.includes(t));

    if (extraTables.length > 0) {
      // Insert before metadata tables
      let insertIndex = output.length;
      for (let i = 0; i < output.length; i++) {
        if (output[i].includes('INSERT INTO public.bulk_operation_log') ||
            output[i].includes('INSERT INTO public.databasechangelog')) {
          insertIndex = i;
          break;
        }
      }

      const extraStatements = [];
      for (const tableName of extraTables) {
        extraStatements.push(...tableInserts[tableName]);
      }

      output = [
        ...output.slice(0, insertIndex),
        ...extraStatements,
        ...output.slice(insertIndex)
      ];
    }

    // Write output file
    const outputContent = output.join('\n\n') + '\n';
    fs.writeFileSync(OUTPUT_FILE, outputContent, 'utf8');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();



























