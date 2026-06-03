# Chat App Backend

A real-time chat backend built using Node.js, TypeScript, and WebSockets.

## Features

* Join chat rooms
* Real-time messaging
* Room-based message broadcasting
* WebSocket communication

## Tech Stack

* Node.js
* TypeScript
* WebSocket (ws)

## Installation

```bash
npm install
```

## Run the Server

```bash
npm run dev
```

Server runs on:

```txt
ws://localhost:5000
```

## WebSocket Events

### Join Room

```json
{
  "type": "join",
  "payload": {
    "roomId": "123"
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

### Receive Message

```json
{
  "type": "chat",
  "payload": {
    "message": "Hello World"
  }
}
```

## Author

Anjeet Singh
