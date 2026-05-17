const { Server } = require('socket.io')
const express = require('express')

let userSocketMap = {}
let io=null;

function initSocket(server) {

    io = new Server(server, {
        cors: {
            origin: [
                "http://localhost:5173",
            ],
            credentials: true
        }
    })




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
                foodId,
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

}

function getUserSocketId(userId) {
    return userSocketMap[userId]
}

const getIO = () => io

module.exports = { getIO, initSocket, getUserSocketId }