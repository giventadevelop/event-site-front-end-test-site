import { fileURLToPath } from 'node:url';
import path from 'node:path';

/** Repository root (mosc-temp), resolved from scripts/mosc-in-migration/lib/ */
const libDir = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(libDir, '../../..');

/** Change cwd to repo root so relative paths (.env.local, manifests) resolve correctly. */
export function ensureRepoRoot() {
  process.chdir(REPO_ROOT);
  return REPO_ROOT;
}
