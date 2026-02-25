import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables only for local development
if (process.env.NODE_ENV !== "production" && process.env.RENDER !== "true") {
  dotenv.config({ path: path.resolve(__dirname, ".env"), quiet: true });
}

// Import DB connection
import connectDB from "./models/db.js";

// Import Routes
import authRoutes from "./routes/authroutes.js";
import doctorRoutes from "./routes/doctor.js";
import appointmentRoutes from "./routes/appointment.js";
import chatbotRoutes from "./routes/chatbot.js";
import reportRoutes from "./routes/report.js";
import emergencyRoutes from "./routes/emergency.js";

const app = express();
const port = process.env.PORT || 5000;

const envOrigins = String(process.env.CORS_ORIGINS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

// Connect Database
connectDB();

/* -------- Middlewares -------- */
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isLocalhost = /^https?:\/\/localhost:\d+$/.test(origin);
      const isVercelDomain = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);
      const isRenderDomain = /^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin);
      const hardcodedTrustedOrigins = [
        "https://auth-app-devv27.vercel.app",
        "https://ai-careconnect.vercel.app",
        "https://www.ai-careconnect.vercel.app",
      ];
      const isTrustedRemote = [...hardcodedTrustedOrigins, ...envOrigins].includes(origin);

      if (isLocalhost || isTrustedRemote || isVercelDomain || isRenderDomain) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Note: global `app.use(cors(...))` above handles preflight (no app.options('*') needed)

app.use(express.urlencoded({ extended: false, limit: "25mb" }));
app.use(express.json({ limit: "25mb" }));

/* -------- Routes -------- */
app.use("/user", authRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/emergency", emergencyRoutes);

/* -------- Health Route -------- */
app.get("/", (req, res) => {
  res.send("API working fine");
});

/* -------- Start Server -------- */
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
