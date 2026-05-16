const express = require('express');
const { sendMessage, getMessages, updatedMessage, deleteMessage, getMessagedUsers } = require('../controllers/message.controller');
const { upload } = require('../middlewares/multer.middleware');
const { createAuthMiddleware } = require('../middlewares/auth.middleware');



const messageRouter = express.Router();

messageRouter.post('/send/:userId',createAuthMiddleware(["restaurant", "ngo", "volunteer"]),upload.single('imageUrl'),sendMessage)
    .get('/get/:userId',createAuthMiddleware(["restaurant", "ngo", "volunteer"]),getMessages)
    .get('/conversations',createAuthMiddleware(["restaurant", "ngo", "volunteer"]),getMessagedUsers)
    .patch('/update/:messageId',createAuthMiddleware(["restaurant", "ngo", "volunteer"]),updatedMessage)
    .delete('/delete/:messageId',createAuthMiddleware(["restaurant", "ngo", "volunteer"]),deleteMessage);



module.exports = messageRouter;