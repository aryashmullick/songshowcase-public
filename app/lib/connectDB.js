import mongoose from "mongoose";

let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
  }
async function connectDB() {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
    if (cached.conn) {
      return cached.conn;
    }
    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      };
      cached.promise = mongoose.connect(process.env.DATABASE_URL, opts).then((mongoose) => {
        return mongoose;
      });
    }
    try { cached.conn = await cached.promise; }
    catch (error) { cached.promise = null; throw error; }
    return cached.conn;
}
export default connectDB;

