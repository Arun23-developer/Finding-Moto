import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  mongoURI: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  nodeEnv: string;
  googleClientId: string | undefined;
  googleClientSecret: string | undefined;
}

const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/finding-moto',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET
};

export default config;
