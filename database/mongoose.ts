import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

declare global {
  // Allow global `mongooseCache` to exist
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// Use a global cache so hot reload in dev doesn't cause new connections
let cached = global.mongooseCache;

// Initializing the cache if it doesn’t exist yet
if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (!MONGODB_URI) throw new Error(" Please define MONGODB_URI in .env.local");

  if (cached.conn) {
    console.log("Using cached MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  console.log(`Connected to MongoDB (${process.env.NODE_ENV} mode)`);
  return cached.conn;
}