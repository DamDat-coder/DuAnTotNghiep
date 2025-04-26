const mongoose = require("mongoose");

import { ConnectOptions } from "mongoose";

const connectDB = async (): Promise<void> => {
  console.log("📡 connectDB() is running...");

  const mongoURI: string = process.env.MONGO_URI || "mongodb://localhost:27017/DB_GraduationProject";

  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true, 
    } as ConnectOptions);

    console.log(`✅ MongoDB connected`);
  } catch (err: unknown) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); 
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB disconnected!");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("🔁 MongoDB reconnected!");
  });
};

module.exports = connectDB;