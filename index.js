import express from "express";
import { connectDB } from "./config/db.js";
import { apiRouter } from "./routes/index.js";
import cookieParser from "cookie-parser";
import cors from 'cors';
import path from "path";
import { fileURLToPath } from "url";
import { startExpiredShowCleaner } from "./utils/expiredShowsCleaner.js";

// Creating an Express application
const app = express();
// Defining the port from environment variables
const port = process.env.PORT || 5000;

// Connecting to the database
connectDB()
// ✅ Start the show cleanup cron
startExpiredShowCleaner();

// CORS Configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, // ✅ Allow credentials
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.urlencoded({ extended: true }));
// Middleware to parse incoming JSON requests
app.use(express.json())
// Middleware to parse cookies from request headers
app.use(cookieParser());
// Root route - Responds with "Hello World!!!!!" when accessed
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// API routes - All API endpoints will be prefixed with "/api"
app.use('/api', apiRouter)

// ----------------------------------
// ⚡ Serve Frontend (Vite production build)
// ----------------------------------

// Needed for __filename and __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use(express.static(path.join(__dirname, 'client')));

// Any other route (except /api) should send frontend index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Starting the Express server and listening on the specified port
app.listen(port, () => {
  console.log(`App Running on ${port}`);
});
