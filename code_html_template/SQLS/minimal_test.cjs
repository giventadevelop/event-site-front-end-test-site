const fs = require('fs');
const path = require('path');

console.log('Starting minimal test...');

const inputFile = 'dump-giventa_event_management-202506240024_pre_tenant_id_with_insert_data.sql';
const outputFile = 'minimal_output.sql';

try {
  if (!fs.existsSync(inputFile)) {
    console.log('Input file does not exist');
    process.exit(1);
  }

  const content = fs.readFileSync(inputFile, 'utf8');
  console.log('File read successfully, length:', content.length);

  const lines = content.split('\n');
  console.log('Lines count:', lines.length);

  // Count INSERT statements
  let insertCount = 0;
  lines.forEach((line, index) => {
    if (line.startsWith('INSERT INTO public.')) {
      insertCount++;
      if (insertCount <= 3) {
        console.log(`INSERT ${insertCount} at line ${index + 1}:`, line.substring(0, 80) + '...');
      }
    }
  });

  console.log('Total INSERT statements found:', insertCount);

  // Write simple output
  fs.writeFileSync(outputFile, `Found ${insertCount} INSERT statements\n`, 'utf8');
  console.log('Output file written successfully');

} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

console.log('Minimal test completed');



























