const express = require('express');
const { sendMessage, getMessages, updatedMessage, deleteMessage } = require('../controllers/message.controller');
const { upload } = require('../middlewares/multer.middleware');



const messageRouter = express.Router();

messageRouter.post('/send/userId',createAuthMiddleware(["restaurant", "ngo", "volunteer"]),upload.single('imageUrl'),sendMessage)
messageRouter.get('/get',createAuthMiddleware(["restaurant", "ngo", "volunteer"]),getMessages)
messageRouter.patch('/update/:messageId',createAuthMiddleware(["restaurant", "ngo", "volunteer"]),updatedMessage)
messageRouter.delete('/delete/:messageId',createAuthMiddleware(["restaurant", "ngo", "volunteer"]),deleteMessage)



module.exports = messageRouter;