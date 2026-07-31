import winston from 'winston';

const { combine, timestamp, json, errors, printf, colorize } = winston.format;

const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// On Vercel serverless the filesystem is read-only and we can't write log files.
// Detect via VERCEL / VERCEL_ENV env vars (Vercel sets these automatically).
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;
const isProd = process.env.NODE_ENV === 'production';

// Console transport works everywhere (Vercel captures stdout/stderr automatically).
const consoleTransport = new winston.transports.Console();

// File transports only on long-running hosts where the filesystem is writable
// (local dev, Render, Railway, Fly.io, etc.). Skip on Vercel.
const fileTransports = isProd && !isVercel
  ? [
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' }),
    ]
  : [];

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'playbeat-api' },
  format: combine(
    timestamp(),
    errors({ stack: true }),
    isProd ? json() : combine(colorize(), devFormat)
  ),
  transports: [consoleTransport, ...fileTransports],
  exceptionHandlers: [consoleTransport],
  rejectionHandlers: [consoleTransport],
});
