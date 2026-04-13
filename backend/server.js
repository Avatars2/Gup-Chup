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
  origin: 'http://localhost:3000',
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

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  () => console.log(`Server running on PORT ${PORT}...`)
);

// --- SOCKET.IO LOGIC ---
const io = require("socket.io")(server, {
  pingTimeout: 60000, // 60s tak connection check karega
  cors: {
    origin: "http://localhost:3000", // Aapka React app ka URL
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  // User apni personal room join karega (using UserID)
  socket.on("setup", async (userData) => {
    socket.join(userData._id);
    console.log("User Setup: " + userData._id);
    
    // Mark user as online
    try {
      await User.findByIdAndUpdate(userData._id, { isOnline: true });
      socket.broadcast.emit("user status change", { userId: userData._id, isOnline: true });
    } catch (e) { console.error(e); }
    
    socket.emit("connected");
  });

  // Chat room join karna (1-on-1 ya Group)
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  // Typing functionality (Optional but cool)
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  // New Message deliver karna
  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  // Message Read Receipt
  socket.on("message read", async (data) => {
    const { chatId, userId } = data;
    try {
      // Broadcast read event to chat room
      socket.in(chatId).emit("read update", { chatId, userId });
    } catch (e) { console.error(e); }
  });

  socket.on("message edit", (updatedMessage) => {
    const chat = updatedMessage.chat;
    if (!chat.users) return;
    chat.users.forEach((user) => {
      if (user._id === updatedMessage.sender._id) return;
      socket.in(user._id).emit("message updated", updatedMessage);
    });
  });

  socket.on("message delete", (deleteData) => {
    const { _id, chat } = deleteData;
    if (!chat.users) return;
    chat.users.forEach((user) => {
      socket.in(user._id).emit("message deleted", { _id, chatId: chat._id });
    });
  });

  // Connection close hone par room leave karna
  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED");
    // We would ideally track the userId here, but it's easier to handle via a custom 'logout' event 
    // or by storing socket.userId during setup.
  });

  socket.on("logout", async (userId) => {
    try {
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
      socket.broadcast.emit("user status change", { userId, isOnline: false, lastSeen: new Date() });
    } catch (e) { console.error(e); }
  });
});