/**
 * Tagged logging for server, API routes, and Edge middleware.
 *
 * IMPORTANT: Do not use Node-only APIs (`process.stderr`, `fs`, etc.) here.
 * This module is imported by `src/middleware.ts` (Edge Runtime). Edge has no
 * `process.stderr` — referencing it breaks production/Turbopack builds.
 */

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

interface LogMessage {
  timestamp: string;
  level: LogLevel;
  tag: string;
  message: string;
  data?: any;
}

/**
 * Emit structured log (works in Node, Edge middleware, and browser).
 * Uses only `console.*` — no `process.stderr` (not available in Edge middleware).
 */
function writeLog(logMessage: LogMessage): void {
  const humanLine = `[${logMessage.tag}] [${logMessage.level}] ${logMessage.message}`;
  const data = logMessage.data ?? '';

  switch (logMessage.level) {
    case 'ERROR':
      console.error(humanLine, data);
      break;
    case 'WARN':
      console.warn(humanLine, data);
      break;
    default:
      console.log(humanLine, data);
  }
}

/**
 * Create a tagged logger for a specific component/module
 */
export function createLogger(tag: string) {
  return {
    info: (message: string, data?: any) => {
      writeLog({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        tag,
        message,
        data,
      });
    },

    warn: (message: string, data?: any) => {
      writeLog({
        timestamp: new Date().toISOString(),
        level: 'WARN',
        tag,
        message,
        data,
      });
    },

    error: (message: string, data?: any) => {
      writeLog({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        tag,
        message,
        data,
      });
    },

    debug: (message: string, data?: any) => {
      writeLog({
        timestamp: new Date().toISOString(),
        level: 'DEBUG',
        tag,
        message,
        data,
      });
    },
  };
}

/**
 * Global logger (use createLogger for component-specific logging)
 */
export const logger = createLogger('GLOBAL');
