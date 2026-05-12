const messageModel = require("../models/message.model")
const { uploadImage } = require("../services/imagekit.service")


async function sendMessage(req, res) {
    try {
        const user = req.user
        const { userId } = req.params
        const { text } = req.body
        let image = null;
        if (req.file) {
            image = await uploadImage({ buffer: req.file.buffer })
        }

        const message = await messageModel.create({
            senderId: user.id,
            receiverId: userId,
            text,
            image
        })

        return res.status(200).json({
            message: "Sent the message successfully",
            message
        })

    } catch (error) {
        return res.status(500).json({
            message: "Error sending the message", error: error.message
        })
    }
}

async function getMessages(req, res) {
    try {
        const user = req.user
        const { userId } = req.params

        const messages = await messageModel.find({
            $or: [
                { senderId: user._id, receiverId: userId },
                { senderId: userId, receiverId: user._id }
            ]
        })
        if (!messages) {
            return res.status(404).json({
                message: "No messages found between the users"
            })
        }
        return res.status(200).json({
            message: "Messages retrieved successfully",
            messages
        })

    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving the messages", error: error.message
        })

    }
}

async function updatedMessage(req, res) {
    try {
        const user = req.user
        const { messageId } = req.params
        const { text } = req.body
        const message = await messageModel.findOne({ _id: messageId, senderId: user._id })
        if (!message) {
            return res.status(404).json({
                message: "Message not found or you are not the sender of the message"
            })
        }
        message.text = text || message.text

        await message.save()
        return res.status(200).json({
            message: "Message updated successfully",
            message
        })
    } catch (error) {
        return res.status(500).json({
            message: "Error updating the message", error: error.message
        })
    }
}

async function deleteMessage(req, res) {
    try {
        const user = req.user
        const { messageId } = req.params
        const message = await messageModel.findOne({ _id: messageId, senderId: user._id })
        if (!message) {
            return res.status(404).json({
                message: "Message not found or you are not the sender of the message"
            })
        }
        await message.deleteOne();
        return res.status(200).json({
            message: "Message deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Error deleting the message", error: error.message
        })
    }
}

module.exports = { sendMessage, getMessages, updatedMessage, deleteMessage }