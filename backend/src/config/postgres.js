import { Pool } from 'pg';
import { logger } from '../utils/logger.js';

let pool = null;

/**
 * Build the SSL config for the pg Pool.
 *
 * Neon (and most cloud Postgres providers) require SSL. The connection string
 * from Neon includes `sslmode=require` and `channel_binding=require`. The `pg`
 * library parses `sslmode=require` into a basic SSL request, but on many
 * runtimes (including Vercel serverless and Node 18+ on Linux) we need to
 * explicitly allow the connection because the system CA bundle may not be
 * picked up automatically.
 *
 * For local dev we keep ssl off so a plain local Postgres works too.
 */
const buildSslConfig = (connectionString) => {
  // If the URL explicitly asks for sslmode=require or verify-full, honour it.
  const wantsSsl = /sslmode\s*=\s*(require|verify-full|verify-ca|prefer)/i.test(connectionString);
  const isProd = process.env.NODE_ENV === 'production';

  if (wantsSsl || isProd) {
    return { rejectUnauthorized: false }; // permissive — Neon cert chain
  }
  return false;
};

export const connectDB = async () => {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
  }

  // Log a redacted version of the URL so we can debug without leaking creds.
  const redacted = connectionString.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
  logger.info(`Connecting to PostgreSQL: ${redacted}`);

  try {
    pool = new Pool({
      connectionString,
      ssl: buildSslConfig(connectionString),
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Surface pool errors (e.g. idle disconnects) instead of silently dropping them.
    pool.on('error', (err) => {
      logger.error(`PostgreSQL pool error: ${err.message}`);
    });

    // Test connection
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as now, current_database() as db');
    client.release();

    logger.info(`PostgreSQL Connected: ${result.rows[0].now} (db: ${result.rows[0].db})`);
    return pool;
  } catch (error) {
    logger.error(`PostgreSQL Connection Error: ${error.message}`);
    logger.error(`Error code: ${error.code || 'n/a'}`);
    throw error;
  }
};

export const getPool = () => {
  if (!pool) throw new Error('Database not connected. Call connectDB() first.');
  return pool;
};

export const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

export const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const disconnectDB = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('PostgreSQL Pool Closed');
  }
};
