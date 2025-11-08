import { NextResponse } from "next/server";
import { connectToDatabase } from '@/database/mongoose';

export async function GET() {
  const mongoose = await connectToDatabase();
  const db = mongoose.connection.db;
  if (!db) throw new Error('Database connection failed');
  
  const alerts = await db.collection("alerts").find({}).toArray();
  return NextResponse.json(alerts);
}