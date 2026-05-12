const { Server } = require('socket.io')
const http = require('http')
const app = require("../app");
const server = http.createServer(app)

let io = new Server(server, {
    cors: {
        origin: '*',
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
})

let userSocketMap = {}

function getUserSocketId(userId) {
    return userSocketMap[userId]
}

io.on('connection', (socket) => {
    console.log("A user connected to Server", socket.id)
    const { userId } = socket.handshake.auth

    if (userId) {
        userSocketMap[userId] = socket.id
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap))

    socket.on("join-room", (foodId) => {
        socket.join(foodId);

        console.log(`Joined room: ${foodId}`);
    });

    socket.on("send-location", (data) => {

        const { foodId, lat, lng, userId } = data;

        io.to(foodId).emit("receive-location", {
            userId,
            lat,
            lng
        });

    });

    socket.on("leave-room", (foodId) => {
        socket.leave(foodId);
    })

    socket.on('disconnect', () => {
        console.log("A user disconnected from Server", socket.id)
        delete userSocketMap[userId]

    })
})


module.exports = { io, server, getUserSocketId }