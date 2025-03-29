import express from "express";
import { connectDB } from "./config/db.js";
import { apiRouter } from "./routes/index.js";
import cookieParser from "cookie-parser";
import cors from 'cors'
// Creating an Express application
const app = express();
// Defining the port from environment variables
const port = process.env.PORT || 5000;

// Connecting to the database
connectDB()
// CORS Configuration
app.use(
  cors({
    origin: "http://localhost:5173", // Allow frontend origin
    credentials: true, // Allow cookies and authentication headers
    methods: "GET,POST,PUT,DELETE,OPTION", // Allowed methods
    allowedHeaders: "Content-Type,Authorization", // Allowed headers
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
app.use('/api',apiRouter)

// Catch-all route for undefined endpoints - Returns a 404 JSON response
app.all("*",(req,res)=>{
    res.status(404).json({message:"Endpoint does not exist"})
})
// Starting the Express server and listening on the specified port
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
