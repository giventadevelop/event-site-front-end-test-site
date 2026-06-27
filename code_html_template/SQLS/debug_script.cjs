const fs = require('fs');

const INPUT_FILE = 'dump-giventa_event_management-202506240024_pre_tenant_id_with_insert_data.sql';
const OUTPUT_FILE = 'debug_output.txt';

function main() {
  console.log('🔍 Debugging INSERT statement parsing...');

  // Read the input file
  const fileContent = fs.readFileSync(INPUT_FILE, 'utf8');
  const lines = fileContent.split(/\r?\n/);

  console.log(`📄 Total lines: ${lines.length}`);

  // Count INSERT statements
  let insertCount = 0;
  let inInsert = false;
  let currentStatement = '';
  const statements = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.match(/^INSERT INTO public\./)) {
      if (currentStatement.trim()) {
        statements.push(currentStatement.trim());
      }
      currentStatement = line;
      inInsert = true;
      insertCount++;
    } else if (inInsert) {
      currentStatement += '\n' + line;
      if (line.trim().endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
        inInsert = false;
      }
    }
  }

  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }

  console.log(`🔍 Found ${statements.length} INSERT statements`);

  // Show first few statements
  let debugOutput = `Found ${statements.length} INSERT statements:\n\n`;

  for (let i = 0; i < Math.min(3, statements.length); i++) {
    debugOutput += `=== STATEMENT ${i + 1} ===\n`;
    debugOutput += statements[i] + '\n\n';
  }

  // Group by table
  const tableInserts = {};
  for (const statement of statements) {
    const match = statement.match(/^INSERT INTO public\.([a-zA-Z0-9_]+) /);
    if (match) {
      const tableName = match[1];
      if (!tableInserts[tableName]) {
        tableInserts[tableName] = 0;
      }
      tableInserts[tableName]++;
    }
  }

  debugOutput += `\n=== TABLES FOUND ===\n`;
  for (const [table, count] of Object.entries(tableInserts)) {
    debugOutput += `${table}: ${count} statements\n`;
  }

  fs.writeFileSync(OUTPUT_FILE, debugOutput, 'utf8');
  console.log(`📝 Debug output written to ${OUTPUT_FILE}`);
}

main();



























