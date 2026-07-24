<![CDATA[<div align="center">

# 💬 Gup Chup

### A Modern Real-Time Chat Application

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**Gup Chup** is a full-stack, real-time messaging platform built with the **MERN stack** and **Socket.IO**. It delivers instant one-on-one and group conversations with rich media sharing, message management, and a sleek dark-themed interface — all in a responsive, mobile-friendly design.

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [API Reference](#-api-reference) · [Deployment](#-deployment)

---

</div>

## ✨ Features

### 💬 Core Messaging
- **Real-Time Communication** — Instant message delivery powered by Socket.IO WebSockets
- **One-on-One Chat** — Private conversations between two users
- **Group Chat** — Create and manage group conversations with multiple participants
- **Message Editing** — Edit your sent messages with an `(edited)` indicator
- **Message Deletion** — Delete messages for everyone in the chat

### 📁 Media & File Sharing
- **Image Uploads** — Share photos directly in the chat
- **Video Sharing** — Send and preview video files
- **Document Attachments** — Upload and share documents (PDFs, etc.)
- **Cloud Storage** — All media files stored securely on **Cloudinary** (10 MB limit per file)

### 👤 User Management
- **User Registration** — Sign up with name, mobile number, and password
- **Secure Authentication** — JWT-based authentication with 30-day token expiry
- **Password Hashing** — Bcrypt encryption for secure password storage
- **Profile Customization** — Update display name and profile picture
- **User Search** — Find users by name or mobile number
- **Online Status & Last Seen** — Track user availability in real time

### 🎨 User Experience
- **Dark-Themed UI** — Elegant, modern dark interface built with Tailwind CSS
- **Responsive Design** — Fully responsive layout for desktop, tablet, and mobile
- **Toast Notifications** — Non-intrusive feedback with React Hot Toast
- **Protected Routes** — Authenticated-only access to the chat interface
- **Message Read Receipts** — Know when your messages have been read
- **Chat Search** — Search through conversations and messages

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI component library |
| **React Router v7** | Client-side routing & navigation |
| **Tailwind CSS 3** | Utility-first styling framework |
| **Socket.IO Client** | Real-time WebSocket communication |
| **Axios** | HTTP client for REST API calls |
| **Lucide React** | Modern icon library |
| **React Hot Toast** | Toast notification system |
| **CryptoJS** | Client-side encryption utilities |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express 5** | Web application framework |
| **MongoDB + Mongoose 9** | NoSQL database & ODM |
| **Socket.IO** | Real-time bidirectional communication |
| **JSON Web Tokens** | Stateless user authentication |
| **Bcrypt.js** | Password hashing & verification |
| **Cloudinary + Multer** | Cloud-based file upload & storage |
| **CORS** | Cross-origin resource sharing |

---

## 📁 Project Structure

```
gup-chup/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js         # Cloudinary SDK configuration
│   │   └── db.js                 # MongoDB connection setup
│   ├── controllers/
│   │   ├── chatControllers.js    # Chat CRUD operations
│   │   ├── messageControllers.js # Message send/edit/delete logic
│   │   └── userControllers.js    # Auth & profile management
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification middleware
│   │   └── errorMiddleware.js    # Global error handler
│   ├── models/
│   │   ├── chatModel.js          # Chat schema (1-on-1 & group)
│   │   ├── messageModel.js       # Message schema with file support
│   │   └── userModel.js          # User schema with password hashing
│   ├── routes/
│   │   ├── chatRoutes.js         # /api/chat endpoints
│   │   ├── messageRoutes.js      # /api/message endpoints
│   │   ├── uploadRoutes.js       # /api/upload endpoints
│   │   └── userRoutes.js         # /api/user endpoints
│   ├── uploads/                  # Local file uploads directory
│   ├── server.js                 # Express app entry point
│   ├── vercel.json               # Vercel deployment config
│   └── package.json
│
├── frontend/
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.js           # Main chat wrapper
│   │   │   ├── ChatList.js       # Sidebar conversation list
│   │   │   ├── ChatScreen.js     # Active chat window
│   │   │   ├── GroupChat.js      # Group chat management
│   │   │   ├── GroupChatModal.js  # Group creation modal
│   │   │   ├── Login.js          # Login form
│   │   │   ├── Register.js       # Registration form
│   │   │   ├── ScrollableChat.js # Chat message feed
│   │   │   ├── MessageInput.js   # Message composer
│   │   │   ├── MessageReactions.js # Emoji reactions
│   │   │   ├── MessageSearch.js  # In-chat search
│   │   │   ├── SideDrawer.js     # User search drawer
│   │   │   ├── UserListItem.js   # User result card
│   │   │   ├── UserProfile.js    # Profile view & editor
│   │   │   └── ThemeToggle.js    # Theme switcher
│   │   ├── context/
│   │   │   ├── AuthContext.js    # Authentication state
│   │   │   ├── ChatProvider.js   # Chat state management
│   │   │   └── ThemeContext.js   # Theme state management
│   │   ├── pages/
│   │   │   ├── Home.js           # Landing page
│   │   │   └── ChatPage.js       # Protected chat page
│   │   ├── App.js                # Root component & routing
│   │   └── index.js              # React entry point
│   ├── tailwind.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** v18 or later — [Download](https://nodejs.org/)
- **npm** v9 or later (comes with Node.js)
- **MongoDB Atlas** account — [Sign up free](https://www.mongodb.com/atlas)
- **Cloudinary** account — [Sign up free](https://cloudinary.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/Avatars2/Gup-Chup.git
cd Gup-Chup
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=http://localhost:3000
```

Start the backend server:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

> The backend runs on `http://localhost:5000` by default.

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm start
```

> The frontend runs on `http://localhost:3000` by default.

### 4. Open the App

Navigate to **http://localhost:3000** in your browser. Register a new account and start chatting!

---

## 📡 API Reference

All API endpoints are prefixed with `/api`. Protected routes require an `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/user/register` | Register a new user | ❌ |
| `POST` | `/api/user/login` | Login with mobile & password | ❌ |
| `GET` | `/api/user?search=` | Search users by name/mobile | ✅ |
| `PUT` | `/api/user/profile` | Update user profile | ✅ |

### Chats

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/chat` | Access or create 1-on-1 chat | ✅ |
| `GET` | `/api/chat` | Fetch all user's chats | ✅ |
| `POST` | `/api/chat/group` | Create a group chat | ✅ |

### Messages

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/message` | Send a new message | ✅ |
| `GET` | `/api/message/:chatId` | Get all messages for a chat | ✅ |
| `PUT` | `/api/message/edit` | Edit a sent message | ✅ |
| `PUT` | `/api/message/delete` | Soft-delete a message | ✅ |
| `PUT` | `/api/message/read` | Mark messages as read | ✅ |

### File Upload

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/upload` | Upload a file to Cloudinary | ❌ |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React)                  │
│  ┌───────────┐  ┌────────────┐  ┌────────────────┐  │
│  │  Pages &   │  │  Context   │  │  Socket.IO     │  │
│  │ Components │◄─┤  Providers │  │  Client        │  │
│  └─────┬─────┘  └─────┬──────┘  └───────┬────────┘  │
│        │              │                  │           │
└────────┼──────────────┼──────────────────┼───────────┘
         │ HTTP (Axios)  │                  │ WebSocket
         ▼              ▼                  ▼
┌────────────────────────────────────────────────────────┐
│                  BACKEND (Express)                     │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Routes   │─▶│ Controllers  │  │  Socket.IO      │  │
│  └──────────┘  └──────┬───────┘  │  Server          │  │
│                       │          └─────────────────┘  │
│  ┌──────────┐  ┌──────▼───────┐                       │
│  │Middleware │  │   Models     │                       │
│  │(Auth/Err) │  │  (Mongoose)  │                       │
│  └──────────┘  └──────┬───────┘                       │
└───────────────────────┼───────────────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
   ┌──────────┐  ┌────────────┐  ┌──────────┐
   │ MongoDB  │  │ Cloudinary │  │   JWT    │
   │  Atlas   │  │  (Media)   │  │ (Tokens) │
   └──────────┘  └────────────┘  └──────────┘
```

---

## 🌐 Deployment

### Backend — Vercel

The backend is configured for **Vercel** deployment with the included `vercel.json`:

```bash
cd backend
npx vercel --prod
```

Set the following environment variables in your Vercel project settings:
- `MONGO_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `FRONTEND_URL`

### Frontend — Vercel / Netlify

```bash
cd frontend
npm run build
```

Update the `.env` variables to point to your deployed backend URL before building:
```env
REACT_APP_API_BASE_URL=https://your-backend.vercel.app/api
REACT_APP_SOCKET_URL=https://your-backend.vercel.app
```

Deploy the `build/` folder to **Vercel**, **Netlify**, or any static hosting service.

---

## 🔐 Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `PORT` | Backend | Server port (default: `5000`) |
| `MONGO_URI` | Backend | MongoDB Atlas connection string |
| `JWT_SECRET` | Backend | Secret key for JWT signing |
| `CLOUDINARY_CLOUD_NAME` | Backend | Cloudinary account cloud name |
| `CLOUDINARY_API_KEY` | Backend | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Backend | Cloudinary API secret |
| `FRONTEND_URL` | Backend | Frontend URL for CORS (default: `http://localhost:3000`) |
| `REACT_APP_API_BASE_URL` | Frontend | Backend API base URL |
| `REACT_APP_SOCKET_URL` | Frontend | Socket.IO server URL |

---

## 🧪 Available Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with Nodemon |

### Frontend

| Command | Description |
|---------|-------------|
| `npm start` | Start React development server |
| `npm run build` | Create optimized production build |
| `npm test` | Run test suite |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m "Add amazing feature"`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ using the MERN Stack**

[⬆ Back to Top](#-gup-chup)

</div>
