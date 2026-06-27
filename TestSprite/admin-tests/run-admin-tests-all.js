/**
 * Runs comprehensive + dynamic admin suites with the same CLI/env base URL.
 * Use this so `npm run test:admin:all -- --port=3001` applies to both scripts.
 */

import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extraArgs = process.argv.slice(2);

function runSuite(name, scriptFile) {
  const scriptPath = path.join(__dirname, scriptFile);
  const result = spawnSync(process.execPath, [scriptPath, ...extraArgs], {
    stdio: 'inherit',
    shell: false,
  });
  if (result.status !== 0 && result.status !== null) {
    process.exit(result.status);
  }
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
}

runSuite('comprehensive', 'comprehensive-admin-test-suite.js');
runSuite('dynamic', 'dynamic-event-test-suite.js');
