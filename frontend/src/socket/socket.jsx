import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const socket = io(backendUrl, {
    autoConnect: false,
    transports: ["websocket", "polling"],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 500,
});

export function connectSocket(userId) {
    if (!socket.connected) {
        socket.auth = { userId };
        socket.connect();
    }
}

export function disconnectSocket() {
    if (socket.connected) {
        socket.disconnect();
    }
}

export function joinRoom(foodId) {
    if (socket.connected && foodId) {
        socket.emit("join-room", foodId);
    }
}

export function leaveRoom(foodId) {
    if (socket.connected && foodId) {
        socket.emit("leave-room", foodId);
    }
}

export function sendLocation({ foodId, lat, lng, userId }) {
    if (socket.connected && foodId && typeof lat === "number" && typeof lng === "number") {
        socket.emit("send-location", { foodId, lat, lng, userId });
    }
}