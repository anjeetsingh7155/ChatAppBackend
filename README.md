# ChatApp Backend

A lightweight real-time chat server built using Node.js, TypeScript, and WebSockets.

## Features

* WebSocket server
* Real-time communication
* Room-based messaging
* Multi-user support
* TypeScript implementation
* Lightweight architecture

## Tech Stack

* Node.js
* TypeScript
* ws (WebSocket library)

## Project Structure

```bash
src/
├── index.ts
└── types/
```

## Installation

Clone the repository:

```bash
git clone https://github.com/anjeetsingh7155/ChatAppBackend.git
```

Navigate to the project:

```bash
cd ChatAppBackend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Or build and run:

```bash
npm run build
npm start
```

## Server Configuration

The WebSocket server runs on:

```ts
const wss = new WebSocketServer({
  port: 8080,
});
```

Server URL:

```bash
ws://localhost:8080
```

## Message Format

### Join Room

```json
{
  "type": "join",
  "payload": {
    "roomId": "red"
  }
}
```

### Send Message

```json
{
  "type": "chat",
  "payload": {
    "message": "Hello World"
  }
}
```

## How It Works

1. Client establishes a WebSocket connection.
2. Client joins a room.
3. Messages are sent to the server.
4. Server identifies the sender's room.
5. Message is broadcast to all users in the same room.

## Future Improvements

* Authentication and authorization
* MongoDB integration
* Message persistence
* User profiles
* Private messaging
* Redis Pub/Sub
* Horizontal scaling
* Docker support

## Author

Anjeet Singh

GitHub:
https://github.com/anjeetsingh7155
