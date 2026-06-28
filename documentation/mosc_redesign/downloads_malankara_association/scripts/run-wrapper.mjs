/**
 * Run a canonical migration script from the repo root, regardless of current cwd.
 * Used by documentation/mosc_redesign/downloads_malankara_association/scripts wrappers.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const docScriptsDir = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(docScriptsDir, '../../../..');

export function runCanonicalScript(relativePath, extraArgs = []) {
  const scriptPath = path.join(REPO_ROOT, relativePath);
  const result = spawnSync(process.execPath, [scriptPath, ...extraArgs], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    env: process.env,
  });
  process.exit(result.status ?? 1);
}
