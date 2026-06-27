const fs = require('fs');

const INPUT_FILE = 'dump-giventa_event_management-202506240024_pre_tenant_id_with_insert_data.sql';
const OUTPUT_FILE = 'test_copy_output.sql';

console.log('Testing file copy...');

try {
  const content = fs.readFileSync(INPUT_FILE, 'utf8');
  console.log('File read successfully, length:', content.length);

  fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
  console.log('File written successfully');

  const writtenContent = fs.readFileSync(OUTPUT_FILE, 'utf8');
  console.log('Verification - written file length:', writtenContent.length);

} catch (error) {
  console.error('Error:', error.message);
}



























