import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({
    port: 8080
});

interface User {
    socket: WebSocket;
    room: string;
}

interface JoinMessage {
    type: "join";
    payload: {
        roomId: string;
    };
}

interface ChatMessage {
    type: "chat";
    payload: {
        message: string;
    };
}

type Message = JoinMessage | ChatMessage;

let allSockets: User[] = [];

wss.on("connection", (socket) => {

    socket.on("message", (message) => {

        const parsedMessage =
            JSON.parse(message.toString()) as Message;

        if (parsedMessage.type === "join") {

            allSockets.push({
                socket,
                room: parsedMessage.payload.roomId
            });
        }

        if (parsedMessage.type === "chat") {

            const currentUser = allSockets.find(
                user => user.socket === socket
            );

            if (!currentUser) return;

            allSockets.forEach(user => {
                if (user.room === currentUser.room) {
                    user.socket.send(
                        parsedMessage.payload.message
                    );
                }
            });
        }
    });

    socket.on("close", () => {
        allSockets = allSockets.filter(
            user => user.socket !== socket
        );
    });
});

console.log("WebSocket Server Running on 8080");