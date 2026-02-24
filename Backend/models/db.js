import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

let mongoUrl = process.env.MONGO_CONN;
if (!mongoUrl) {
  mongoUrl = "";
} else {
  // Remove unsupported query options that may appear in some stored URIs
  mongoUrl = mongoUrl.replace(/\?test-db=[^&]*/i, "");
  // Clean up any leftover trailing '?' or '&'
  mongoUrl = mongoUrl.replace(/[?&]$/i, "");
}

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log("✅ Connected to MongoDB Atlas");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.log(process.env.MONGO_CONN);
  }
};

export default connectDB;
