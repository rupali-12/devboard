// server/src/config/database.ts
import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    await mongoose.connect(uri, {
      maxPoolSize: 10, // Connection pool — max 10 simultaneous DB connections
    });

    console.log('✅  MongoDB connected successfully');

    mongoose.connection.on('error', (err) => {
      console.error('❌  MongoDB connection error:', err);
    });
  } catch (error) {
    console.error('❌  Failed to connect to MongoDB:', error);
    process.exit(1); // Exit the app — no point running without a database
  }
}