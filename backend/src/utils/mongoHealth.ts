import mongoose from 'mongoose';

export interface MongoHealthStatus {
  connected: boolean;
  readyState: number;
  host?: string;
  message: string;
}

/**
 * Check MongoDB connection status
 * readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
 */
export const checkMongoDBConnection = async (): Promise<MongoHealthStatus> => {
  try {
    const readyState = mongoose.connection.readyState;
    const host = mongoose.connection.host;

    // Attempt to ping the database if connected
    if (readyState === 1) {
      try {
        await mongoose.connection.db?.admin().ping();
        return {
          connected: true,
          readyState,
          host,
          message: 'MongoDB is connected and responding',
        };
      } catch (pingErr) {
        return {
          connected: false,
          readyState,
          host,
          message: 'MongoDB connection exists but ping failed',
        };
      }
    }

    // Map readyState to status
    const stateMessages: Record<number, string> = {
      0: 'MongoDB is disconnected',
      1: 'MongoDB is connected',
      2: 'MongoDB is connecting',
      3: 'MongoDB is disconnecting',
    };

    return {
      connected: false,
      readyState,
      host,
      message: stateMessages[readyState] || 'Unknown connection state',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      connected: false,
      readyState: mongoose.connection.readyState,
      message: `MongoDB health check failed: ${errorMessage}`,
    };
  }
};

/**
 * Get verbose MongoDB connection details
 */
export const getMongoDBDetails = async () => {
  const health = await checkMongoDBConnection();
  const conn = mongoose.connection;

  return {
    ...health,
    uri: process.env.MONGO_URI ? 'configured' : 'not configured',
    database: conn.db?.databaseName,
    timestamp: new Date().toISOString(),
  };
};
