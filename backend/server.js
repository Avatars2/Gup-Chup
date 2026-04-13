const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Routes Import
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const User = require("./models/userModel");
const Message = require("./models/messageModel");

connectDB(); // MongoDB connect karne ke liye

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // JSON data accept karne ke liye
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Endpoints
app.use("/api/user", userRoutes);       // Signup, Login, Search
app.use("/api/chat", chatRoutes);       // Create/Fetch Chats & Groups
app.use("/api/message", messageRoutes); // Send/Fetch Messages
app.use("/api/upload", uploadRoutes);    // File Upload

// Error Handling (Agar route na mile ya koi crash ho)
app.use(notFound);
app.use(errorHandler);

// For Vercel deployment, export the app
module.exports = app;

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on PORT ${PORT}...`));
}
