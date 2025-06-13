const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const pdfParse = require("pdf-parse");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

const PORT = process.env.SERVER_PORT || process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// In-memory storage (in production, use a database)
let pdfs = [];
let comments = {};
let connectedUsers = new Map();

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("user:join", ({ userId, pdfId }) => {
    console.log(`User ${userId} joined PDF ${pdfId}`);

    // Add user to room
    socket.join(pdfId);

    // Store user info
    connectedUsers.set(socket.id, { userId, pdfId, socketId: socket.id });

    // Get users in this room
    const roomUsers = Array.from(connectedUsers.values())
      .filter((user) => user.pdfId === pdfId)
      .map((user) => ({
        id: user.userId,
        name: `User ${user.userId}`,
        isOnline: true,
      }));

    // Notify room about user list update
    io.to(pdfId).emit("users:update", { users: roomUsers });

    // Send existing comments to the new user
    if (comments[pdfId]) {
      socket.emit("comments:sync", { comments: comments[pdfId] });
    }
  });

  socket.on("user:leave", ({ userId, pdfId }) => {
    console.log(`User ${userId} left PDF ${pdfId}`);
    socket.leave(pdfId);

    // Remove user
    connectedUsers.delete(socket.id);

    // Update room users
    const roomUsers = Array.from(connectedUsers.values())
      .filter((user) => user.pdfId === pdfId)
      .map((user) => ({
        id: user.userId,
        name: `User ${user.userId}`,
        isOnline: true,
      }));

    io.to(pdfId).emit("users:update", { users: roomUsers });
  });

  socket.on("comment:add", (comment) => {
    console.log("New comment:", comment);

    // Find user's current PDF
    const userData = connectedUsers.get(socket.id);
    if (!userData) return;

    const pdfId = userData.pdfId;

    // Initialize comments array for PDF if not exists
    if (!comments[pdfId]) {
      comments[pdfId] = [];
    }

    // Add comment
    comments[pdfId].push(comment);

    // Broadcast to all users in the room
    io.to(pdfId).emit("comment:add", comment);
  });

  socket.on("comment:delete", ({ commentId }) => {
    console.log("Delete comment:", commentId);

    const userData = connectedUsers.get(socket.id);
    if (!userData) return;

    const pdfId = userData.pdfId;

    if (comments[pdfId]) {
      comments[pdfId] = comments[pdfId].filter(
        (comment) => comment.id !== commentId
      );
      io.to(pdfId).emit("comment:delete", { commentId });
    }
  });

  socket.on("pdf:page-change", ({ userId, pageNumber }) => {
    const userData = connectedUsers.get(socket.id);
    if (!userData) return;

    const pdfId = userData.pdfId;
    socket.to(pdfId).emit("pdf:page-change", { userId, pageNumber });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    const userData = connectedUsers.get(socket.id);
    if (userData) {
      const { pdfId } = userData;
      connectedUsers.delete(socket.id);

      // Update room users
      const roomUsers = Array.from(connectedUsers.values())
        .filter((user) => user.pdfId === pdfId)
        .map((user) => ({
          id: user.userId,
          name: `User ${user.userId}`,
          isOnline: true,
        }));

      io.to(pdfId).emit("users:update", { users: roomUsers });
    }
  });
});

// API Routes

// Get all PDFs
app.get("/api/pdfs", (req, res) => {
  res.json(pdfs);
});

// Get specific PDF
app.get("/api/pdfs/:id", (req, res) => {
  const pdf = pdfs.find((p) => p.id === req.params.id);
  if (!pdf) {
    return res.status(404).json({ error: "PDF not found" });
  }
  res.json(pdf);
});

// Upload PDF
app.post("/api/pdfs/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    const filePath = req.file.path;
    const buffer = fs.readFileSync(filePath);

    // Parse PDF to get page count
    let totalPages = 1;
    try {
      const pdfData = await pdfParse(buffer);
      totalPages = pdfData.numpages || 1;
    } catch (error) {
      console.warn("Could not parse PDF for page count:", error.message);
    }

    const pdfMeta = {
      id: uuidv4(),
      filename: req.file.originalname,
      title: path.parse(req.file.originalname).name,
      totalPages,
      uploadedAt: new Date().toISOString(),
      uploadedBy: req.body.uploadedBy || "anonymous",
      fileSize: req.file.size,
      url: `/api/pdfs/${req.file.filename}/file`,
    };

    // Store PDF metadata
    pdfs.push(pdfMeta);

    // Initialize comments for this PDF
    comments[pdfMeta.id] = [];

    res.json(pdfMeta);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload PDF" });
  }
});

// Serve PDF files
app.get("/api/pdfs/:filename/file", (req, res) => {
  const filePath = path.join(uploadsDir, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline");
  res.sendFile(filePath);
});

// Delete PDF
app.delete("/api/pdfs/:id", (req, res) => {
  const index = pdfs.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "PDF not found" });
  }

  const pdf = pdfs[index];

  // Delete file from disk
  const filename = pdf.url.split("/").pop();
  const filePath = path.join(uploadsDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Remove from array
  pdfs.splice(index, 1);

  // Remove comments
  delete comments[req.params.id];

  res.json({ message: "PDF deleted successfully" });
});

// Comment API routes

// Get comments for a PDF
app.get("/api/pdfs/:id/comments", (req, res) => {
  const pdfComments = comments[req.params.id] || [];
  res.json(pdfComments);
});

// Add comment to PDF
app.post("/api/pdfs/:id/comments", (req, res) => {
  const pdfId = req.params.id;

  if (!comments[pdfId]) {
    comments[pdfId] = [];
  }

  const comment = {
    id: uuidv4(),
    ...req.body,
    timestamp: new Date().toISOString(),
  };

  comments[pdfId].push(comment);
  res.json(comment);
});

// Update comment
app.put("/api/pdfs/:id/comments/:commentId", (req, res) => {
  const { id: pdfId, commentId } = req.params;

  if (!comments[pdfId]) {
    return res.status(404).json({ error: "PDF not found" });
  }

  const commentIndex = comments[pdfId].findIndex((c) => c.id === commentId);
  if (commentIndex === -1) {
    return res.status(404).json({ error: "Comment not found" });
  }

  comments[pdfId][commentIndex] = {
    ...comments[pdfId][commentIndex],
    content: req.body.content,
    timestamp: new Date().toISOString(),
  };

  res.json(comments[pdfId][commentIndex]);
});

// Delete comment
app.delete("/api/pdfs/:id/comments/:commentId", (req, res) => {
  const { id: pdfId, commentId } = req.params;

  if (!comments[pdfId]) {
    return res.status(404).json({ error: "PDF not found" });
  }

  const initialLength = comments[pdfId].length;
  comments[pdfId] = comments[pdfId].filter((c) => c.id !== commentId);

  if (comments[pdfId].length === initialLength) {
    return res.status(404).json({ error: "Comment not found" });
  }

  res.json({ message: "Comment deleted successfully" });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    pdfs: pdfs.length,
    connectedUsers: connectedUsers.size,
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server error:", error);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "File too large. Maximum size is 10MB." });
    }
  }

  res.status(500).json({ error: "Internal server error" });
});

// Start server
server.listen(PORT, () => {
  console.log(`✅ LiveCollab server running on port ${PORT}`);
  console.log(`📁 File uploads stored in: ${uploadsDir}`);
  console.log(`🌐 API endpoints: http://localhost:${PORT}/api`);
  console.log(`🔌 Socket.IO server: http://localhost:${PORT}`);
});
