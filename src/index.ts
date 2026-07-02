import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";
import { Message } from "./models/Message.js";
import { authMiddleware } from "./middleware/auth.js";
import type { AuthRequest } from "./middleware/auth.js";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "https://studyspace-wine.vercel.app/",
    credentials: true,
  })
);
app.use(express.json());

// Connect to MongoDB
connectDB();

// HTTP REST Endpoints
app.post("/api/auth/register", async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env['JWT_SECRET'] || "study-chat-jwt-secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/auth/login", async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env['JWT_SECRET'] || "study-chat-jwt-secret",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/messages/:room", authMiddleware, async (req: AuthRequest, res: express.Response): Promise<any> => {
  try {
    const roomName = String(req.params['room']);
    const messages = await Message.find({ room: roomName })
      .sort({ createdAt: 1 })
      .limit(50);
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});


app.get("/",(req: express.Request, res: express.Response)=>{

  res.send("Backend is started")
})


// Setup HTTP server
const server = http.createServer(app);

// Setup WebSocket server sharing the same server/port
const wss = new WebSocketServer({ server });

interface UserSocket {
  socket: WebSocket;
  room: string;
  userId: string;
  userName: string;
}

let allSockets: UserSocket[] = [];

wss.on("connection", (socket) => {
  socket.on("message", async (messageStr) => {
    try {
      const parsedMessage = JSON.parse(messageStr.toString());

      if (parsedMessage.type === "join") {
        const { roomId, token } = parsedMessage.payload;
        
        if (!token) {
          socket.send(JSON.stringify({ type: "error", payload: { message: "No auth token provided." } }));
          return;
        }

        // Verify token
        let decoded: any;
        try {
          const secret: string = process.env['JWT_SECRET'] || "study-chat-jwt-secret";
          decoded = jwt.verify(token, secret);
        } catch (err) {
          socket.send(JSON.stringify({ type: "error", payload: { message: "Auth token invalid." } }));
          return;
        }

        // Remove this socket if it was already in another room
        allSockets = allSockets.filter(user => user.socket !== socket);

        // Add socket to room
        allSockets.push({
          socket,
          room: roomId,
          userId: decoded.id,
          userName: decoded.name
        });

        // Send confirmation to user
        socket.send(JSON.stringify({ type: "joined", payload: { roomId } }));
      }

      if (parsedMessage.type === "chat") {
        const currentUser = allSockets.find(user => user.socket === socket);
        if (!currentUser) {
          socket.send(JSON.stringify({ type: "error", payload: { message: "You are not in a room." } }));
          return;
        }

        // Save to Database
        const dbMessage = await Message.create({
          sender: currentUser.userId,
          senderName: currentUser.userName,
          room: currentUser.room,
          text: parsedMessage.payload.message
        });

        // Broadcast to all sockets in the same room
        const broadcastPayload = {
          type: "message",
          payload: {
            id: dbMessage._id,
            text: dbMessage.text,
            senderId: dbMessage.sender,
            senderName: dbMessage.senderName,
            room: dbMessage.room,
            createdAt: dbMessage.createdAt
          }
        };

        allSockets.forEach(user => {
          if (user.room === currentUser.room && user.socket.readyState === WebSocket.OPEN) {
            user.socket.send(JSON.stringify(broadcastPayload));
          }
        });
      }
    } catch (err: any) {
      console.error("WS error processing message:", err);
    }
  });

  socket.on("close", () => {
    allSockets = allSockets.filter(user => user.socket !== socket);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Express and WebSocket server running on port ${PORT}`);
});