import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is not defined');
  }

  try {
    await mongoose.connect(uri, {
      maxPoolSize: 10,
    });

    isConnected = true;

    console.log('✅ MongoDB connected successfully');

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error; // <-- don't process.exit()
  }
}