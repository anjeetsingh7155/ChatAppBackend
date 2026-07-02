# 📘 StudySpace Backend - Collaborative Study Chat Server

This is the backend server for **StudySpace**, a real-time collaborative course-study discussion platform. The application is built using a modern MERN architecture, incorporating a combined **Express REST API** and an **authenticated WebSocket (WS) server** running concurrently on a single port. All session data and message logs are saved and retrieved persistently using **MongoDB**.

---

## ⚡ Key Features

1. **Combined Express & WebSocket Server**: Both REST endpoints and WebSocket protocols listen on the same port (`8080`) using standard HTTP server upgrades.
2. **MongoDB Database Persistence**: Built schemas using Mongoose to manage users and study message history.
3. **Session Authentication (JWT & bcryptjs)**:
   - Registers new users with securely hashed passwords using `bcryptjs`.
   - Logs in users and returns a signed JSON Web Token (JWT) valid for 7 days.
   - Restricts API access using a reusable authorization middleware.
4. **WebSocket Authentication & Safety**:
   - Requires client WebSocket connections to supply a valid JWT token on join.
   - Automatically maps WebSocket events to registered database profiles (showing names instead of anonymous labels).
5. **Channel History Retrieval**: Serves persistent history queries, retrieving the last 50 messages from MongoDB when a user switches channels.
6. **Strict TypeScript & ESM**: Built with TypeScript `verbatimModuleSyntax` and ES Modules (`"type": "module"`) configuration.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Server Framework**: Express.js
- **Database ODM**: Mongoose / MongoDB
- **Real-Time Communication**: ws (WebSocket Library)
- **Security & Session**: jsonwebtoken (JWT), bcryptjs
- **Development Tooling**: TypeScript, ts-node, dotenv, cors

---

## 📁 Project Structure

```bash
ChatApplication/
├── src/
│   ├── config/
│   │   └── db.ts            # Mongoose MongoDB Connection Configuration
│   ├── middleware/
│   │   └── auth.ts          # Express JWT Authentication Middleware
│   ├── models/
│   │   ├── Message.ts       # Mongoose Schema for persistent chat messages
│   │   └── User.ts          # Mongoose Schema for user credentials
│   └── index.ts             # Server entrypoint (Express + WebSocket logic)
├── .env                     # Environment Configurations
├── tsconfig.json            # TypeScript Compiler Configuration
└── package.json             # App dependencies & scripts
```

---

## 🔌 API Documentation

### 🔑 Authentication Endpoints

#### Register User
* **URL**: `/api/auth/register`
* **Method**: `POST`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "60c72b2f9b1d8b0015f8a002",
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  }
  ```

#### Login User
* **URL**: `/api/auth/login`
* **Method**: `POST`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "60c72b2f9b1d8b0015f8a002",
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  }
  ```

---

### 💬 Chat History Endpoints

#### Get Channel History
Retrieves up to 50 previous messages from MongoDB for the specified room.
* **URL**: `/api/messages/:room`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK)**:
  ```json
  [
    {
      "_id": "60c72b2f9b1d8b0015f8a010",
      "sender": "60c72b2f9b1d8b0015f8a002",
      "senderName": "Jane Doe",
      "room": "web-dev",
      "text": "Hello world! Learning React today.",
      "createdAt": "2026-07-02T10:45:00.000Z",
      "updatedAt": "2026-07-02T10:45:00.000Z"
    }
  ]
  ```

---

## 📡 WebSocket Communications

All client interactions occur through WebSocket messages formatted as JSON objects.

### 1. Join Room
Sent by the client immediately upon establishing a connection (or switching rooms).
```json
{
  "type": "join",
  "payload": {
    "roomId": "web-dev",
    "token": "<JWT_TOKEN>"
  }
}
```
*On successful connection, the server will remove the socket from any previous rooms, map the socket to the token profile, and send a `joined` confirmation payload to the user.*

### 2. Send Message
Sent by the client to broadcast message content to all users currently inside the active room.
```json
{
  "type": "chat",
  "payload": {
    "message": "Hey everyone, check this out!"
  }
}
```
*On receipt, the server writes the message logs persistently to MongoDB and broadcasts a `message` packet containing the timestamp and author profile.*

### 3. Broadcast Packet
Dispatched by the server in real-time to all WebSocket connections listening inside the matching room.
```json
{
  "type": "message",
  "payload": {
    "id": "60c72b2f9b1d8b0015f8a011",
    "text": "Hey everyone, check this out!",
    "senderId": "60c72b2f9b1d8b0015f8a002",
    "senderName": "Jane Doe",
    "room": "web-dev",
    "createdAt": "2026-07-02T10:46:30.000Z"
  }
}
```

---

## 🚀 Setup & Installation

### 1. Configure MongoDB
Ensure your local MongoDB instance is running. By default, the server expects:
`mongodb://127.0.0.1:27017/study-chat-db`

### 2. Set Up Environment Variables
Create a file named `.env` in the root backend directory:
```env
PORT=8080
MONGO_URI=mongodb://127.0.0.1:27017/study-chat-db
JWT_SECRET=your_jwt_signing_secret_key
```

### 3. Install Dependencies
Run the following inside your terminal:
```bash
npm install
```

### 4. Build and Run Server
Start the server in development mode (compiles and watches TypeScript files):
```bash
npm run dev
```

For production builds, compile and execute dist bundles:
```bash
npm run build
npm start
```
