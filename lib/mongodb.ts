import mongoose from "mongoose";

const MONGODB_URI: string = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache:
    | MongooseCache
    | undefined;
}

const globalWithMongoose = global as typeof global & {
  mongooseCache?: MongooseCache;
};

const cached: MongooseCache =
  globalWithMongoose.mongooseCache || {
    conn: null,
    promise: null,
  };

if (!globalWithMongoose.mongooseCache) {
  globalWithMongoose.mongooseCache =
    cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  try {
    // Return existing connection
    if (cached.conn) {
      return cached.conn;
    }

    // Create new connection promise
    if (!cached.promise) {
      const options: mongoose.ConnectOptions = {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      cached.promise = mongoose.connect(
        MONGODB_URI,
        options
      );
    }

    // Await connection
    cached.conn = await cached.promise;

    console.log("✅ MongoDB connected");

    return cached.conn;
  } catch (error) {
    cached.promise = null;

    console.error(
      "❌ MongoDB connection error:",
      error
    );

    throw error;
  }
}

export default mongoose;