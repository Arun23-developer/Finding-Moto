import mongoose from 'mongoose';
import config from '../config';

let connecting = false;
let retryTimer: NodeJS.Timeout | null = null;

const scheduleRetry = () => {
  if (retryTimer) return;

  retryTimer = setTimeout(() => {
    retryTimer = null;
    void connectDB();
  }, 5000);
};

const connectDB = async (): Promise<void> => {
  if (connecting) return;
  connecting = true;

  try {
    mongoose.set('bufferCommands', false);

    mongoose.connection.removeAllListeners('disconnected');
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Retrying connection...');
      scheduleRetry();
    });

    const conn = await mongoose.connect(config.mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Migrate: drop old unique index on email alone (now compound email+role)
    try {
      const collection = conn.connection.collection('users');
      const indexes = await collection.indexes();
      const oldEmailIndex = indexes.find(
        (idx: any) => idx.key?.email && !idx.key?.role && idx.unique
      );
      if (oldEmailIndex && oldEmailIndex.name) {
        await collection.dropIndex(oldEmailIndex.name);
        console.log('Dropped old unique email index (migrated to email+role)');
      }
    } catch (indexErr: any) {
      // Index may already be gone — ignore
      if (indexErr?.code !== 27) {
        console.warn('Index migration note:', indexErr?.message);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`MongoDB connection failed: ${errorMessage}`);
    scheduleRetry();
  } finally {
    connecting = false;
  }
};

export default connectDB;
