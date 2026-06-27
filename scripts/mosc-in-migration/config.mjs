/**
 * Default root for migration downloads (override with MOSC_DOWNLOAD_ROOT).
 * @type {string}
 */
export const DEFAULT_DOWNLOAD_ROOT =
  process.platform === 'win32'
    ? 'C:\\E_Drive\\code_backup\\mosc_downloads'
    : `${process.env.HOME || process.env.USERPROFILE || '.'}/mosc_downloads`;

export const DEFAULT_DELAY_MS = 1500;
export const DEFAULT_USER_AGENT =
  'MOSC-MigrationScript/1.0 (+https://github.com/your-org/mosc-temp; contact@your-org.example; one-off migration)';
