const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, 'dump-giventa_event_management-202506240024_pre_tenant_id_with_insert_data.sql');
const OUTPUT_FILE = path.join(__dirname, 'dump-giventa_event_management-202506240024_pre_tenant_id_with_insert_data.ordered.sql');

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
  'bulk_operation_log',
  'databasechangelog',
  'databasechangeloglock',
];

function main() {
  const sql = fs.readFileSync(INPUT_FILE, 'utf8');
  const lines = sql.split(/\r?\n/);
  const insertRegex = /^INSERT INTO public\.([a-zA-Z0-9_]+) /;
  const tableInserts = {};
  const otherInserts = [];

  // Group INSERTs by table
  for (const line of lines) {
    const match = line.match(insertRegex);
    if (match) {
      const table = match[1];
      if (!tableInserts[table]) tableInserts[table] = [];
      tableInserts[table].push(line);
    }
  }

  // Find all tables present in the file
  const allTables = Object.keys(tableInserts);

  // Find tables not in TABLE_ORDER
  const extraTables = allTables.filter(t => !TABLE_ORDER.includes(t));

  // Compose output in the required order
  let output = [];
  for (const table of TABLE_ORDER) {
    if (tableInserts[table]) {
      output = output.concat(tableInserts[table]);
    }
  }
  // Add any extra tables just before the last three
  const lastThree = TABLE_ORDER.slice(-3);
  const beforeLastThree = output.length - lastThree.reduce((acc, t) => acc + (tableInserts[t]?.length || 0), 0);
  let extraInserts = [];
  for (const table of extraTables) {
    extraInserts = extraInserts.concat(tableInserts[table]);
  }
  // Insert extra tables before the last three
  if (extraInserts.length > 0) {
    // Find where to insert: before the first of the last three
    let insertIdx = output.length;
    for (let i = 0; i < output.length; ++i) {
      if (lastThree.some(t => output[i].includes(`INSERT INTO public.${t} `))) {
        insertIdx = i;
        break;
      }
    }
    output = [
      ...output.slice(0, insertIdx),
      ...extraInserts,
      ...output.slice(insertIdx),
    ];
  }

  fs.writeFileSync(OUTPUT_FILE, output.join('\n') + '\n', 'utf8');
  console.log(`Done! Output written to ${OUTPUT_FILE}`);
}

main();