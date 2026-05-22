/**
 * Minimal structured logger for test output.
 * Replace with pino/winston if richer logging is needed.
 */
export const logger = {
  info: (msg: string, meta?: Record<string, unknown>): void => {
    console.log(`[INFO] ${msg}`, meta ?? '');
  },
  warn: (msg: string, meta?: Record<string, unknown>): void => {
    console.warn(`[WARN] ${msg}`, meta ?? '');
  },
  error: (msg: string, meta?: Record<string, unknown>): void => {
    console.error(`[ERROR] ${msg}`, meta ?? '');
  },
};
