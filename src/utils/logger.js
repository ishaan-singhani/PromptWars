/**
 * Lightweight logging utility for MindBoard.
 * In production mode, all logging is suppressed to avoid leaking
 * sensitive information to the browser console.
 * In development mode, logs are forwarded to the native console methods.
 *
 * @module utils/logger
 */

const isDev = import.meta.env.DEV;

/**
 * Logs an error message with context.
 * Only outputs to console in development mode.
 *
 * @param {string} context - A label describing where the error occurred.
 * @param {Error|string} error - The error object or message.
 */
export function logError(context, error) {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.error(`[MindBoard] ${context}:`, error);
  }
}

/**
 * Logs a warning message with context.
 * Only outputs to console in development mode.
 *
 * @param {string} context - A label describing where the warning occurred.
 * @param  {...any} args - Additional data to log.
 */
export function logWarn(context, ...args) {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.warn(`[MindBoard] ${context}:`, ...args);
  }
}
