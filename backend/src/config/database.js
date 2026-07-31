import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

let cachedConnection = null;

/**
 * Get the MongoDB URI from any of the common env var names.
 * Different hosts use different conventions:
 *   - MONGODB_URI   (canonical, used by Vercel + our .env.example)
 *   - MONGODB_URL   (Render's default suggestion)
 *   - MONGO_URI     (older convention)
 */
const getMongoUri = () => {
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGODB_URL ||
    process.env.MongoDB_URL ||
    process.env.MONGO_URI;
  if (!uri) {
    throw new Error(
      'MongoDB connection string not found. Set MONGODB_URI (or MONGODB_URL) env var. ' +
      'Example: mongodb+srv://user:pass@cluster.mongodb.net/playbeat?retryWrites=true&w=majority'
    );
  }
  return uri;
};

export const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,  // give cold starts more time
    socketTimeoutMS: 45000,
  };

  try {
    const uri = getMongoUri();
    // Log a redacted URI to avoid leaking credentials to log aggregators.
    const redacted = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
    logger.info(`Connecting to MongoDB: ${redacted}`);

    const conn = await mongoose.connect(uri, options);
    cachedConnection = conn;
    logger.info(
      `MongoDB Connected: ${conn.connection.host} (db: ${conn.connection.name})`
    );
    return conn;
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    // Retry logic for serverless — non-blocking on long-running hosts (Render will
    // restart the process if it dies, but a retry avoids a full redeploy cycle).
    setTimeout(connectDB, 5000);
    throw error;
  }
};

export const disconnectDB = async () => {
  if (cachedConnection) {
    await mongoose.disconnect();
    cachedConnection = null;
    logger.info('MongoDB Disconnected');
  }
};
