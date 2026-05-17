const messageModel = require("../models/message.model")
const { uploadImage, deleteImage } = require("../services/imagekit.service")
const mongoose = require("mongoose")
const { getUserSocketId, getIO } = require("../socket/socket")


async function sendMessage(req, res) {
    try {
        const user = req.user
        const { userId } = req.params
        const { text } = req.body
        let image = null;
        if (req.file) {
            image = await uploadImage({ buffer: req.file.buffer })
        }

        const newMessage = await messageModel.create({
            senderId: user.id,
            receiverId: userId,
            text,
            image
        })
        let receiverSocketId = getUserSocketId(userId)
        if (receiverSocketId) {
            getIO().to(receiverSocketId).emit("newMessage", newMessage)
        }

        return res.status(200).json({
            message: "Sent the message successfully",
            messageData: newMessage
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
                { senderId: user.id, receiverId: userId },
                { senderId: userId, receiverId: user.id }
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
        const message = await messageModel.findOne({ _id: messageId, senderId: user.id })
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
        const message = await messageModel.findOne({ _id: messageId, senderId: user.id })
        if (!message) {
            return res.status(404).json({
                message: "Message not found or you are not the sender of the message"
            })
        }
        if (message.image) {
            await deleteImage(message.image.fileId)
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

async function getMessagedUsers(req, res) {

    try {

        const currentUserId = new mongoose.Types.ObjectId(
            req.user.id
        );

        const users = await messageModel.aggregate([

            {
                $match: {
                    $or: [
                        { senderId: currentUserId },
                        { receiverId: currentUserId }
                    ]
                }
            },

            {
                $project: {

                    otherUser: {
                        $cond: [
                            {
                                $eq: [
                                    "$senderId",
                                    currentUserId
                                ]
                            },

                            "$receiverId",

                            "$senderId"
                        ]
                    },

                    createdAt: 1
                }
            },

            {
                $sort: {
                    createdAt: -1
                }
            },

            {
                $group: {

                    _id: "$otherUser",

                    latestMessageAt: {
                        $first: "$createdAt"
                    }
                }
            },

            {
                $lookup: {
                    from: "users",

                    localField: "_id",

                    foreignField: "_id",

                    as: "user"
                }
            },

            {
                $unwind: "$user"
            },

            {
                $project: {

                    _id: "$user._id",

                    name: "$user.name",

                    profileImage: "$user.profileImage",

                    latestMessageAt: 1
                }
            },

            {
                $sort: {
                    latestMessageAt: -1
                }
            }

        ]);

        return res.status(200).json({

            success: true,

            message: "Messaged users fetched successfully",

            users

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Error fetching users"

        });

    }
}



module.exports = { sendMessage, getMessages, updatedMessage, deleteMessage, getMessagedUsers }
