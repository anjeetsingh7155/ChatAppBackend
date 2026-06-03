import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 5000 });

interface User {
  socket: WebSocket;
  room: string;
}

let allSockets: User[] = [];

wss.on("connection", (socket) => {
  console.log("User connected");

  socket.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());

      if (parsedMessage.type === "join") {
        const roomId = parsedMessage.payload.roomId;

        const existingUser = allSockets.find(
          (user) => user.socket === socket
        );

        if (existingUser) {
          existingUser.room = roomId;
        } else {
          allSockets.push({
            socket,
            room: roomId,
          });
        }

        console.log(`User joined room ${roomId}`);
      }

      if (parsedMessage.type === "chat") {
        const currentUser = allSockets.find(
          (user) => user.socket === socket
        );

        if (!currentUser) {
          socket.send(
            JSON.stringify({
              error: "Please join a room first",
            })
          );
          return;
        }

        const roomId = currentUser.room;

        allSockets.forEach((user) => {
          if (
            user.room === roomId &&
            user.socket.readyState === WebSocket.OPEN
          ) {
            user.socket.send(
              JSON.stringify({
                type: "chat",
                payload: {
                  message: parsedMessage.payload.message,
                },
              })
            );
          }
        });
      }
    } catch (error) {
      socket.send(
        JSON.stringify({
          error: "Invalid message format",
        })
      );
    }
  });

  socket.on("close", () => {
    allSockets = allSockets.filter(
      (user) => user.socket !== socket
    );

    console.log("User disconnected");
  });
});

console.log("Server is running on ws://localhost:5000");