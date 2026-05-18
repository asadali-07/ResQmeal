const { getUserSocketId,getIO} = require("../socket/socket");


async function sendNotification(payload) {
    

    try {
        const receiverSocketId = getUserSocketId (payload.receiverId);
        if (receiverSocketId) {
            getIO().to(receiverSocketId).emit("notification", payload);
        }

    } catch (err) {
        console.error("Error emitting notification:", err);
    }

    return null; 
}

module.exports = {
    sendNotification
};
