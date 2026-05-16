const { getUserSocketId, io } = require("../socket/socket");


async function sendNotification(payload) {
    

    try {
        const receiverSocketId = getUserSocketId (payload.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("notification", payload);
        }

    } catch (err) {
        console.error("Error emitting notification:", err);
    }

    return null; 
}

module.exports = {
    sendNotification
};
