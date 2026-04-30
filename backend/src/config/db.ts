import mongoose from "mongoose";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI in environment");
  }

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || "ai_travel_planner",
  });

  console.log("MongoDB connected");
}
