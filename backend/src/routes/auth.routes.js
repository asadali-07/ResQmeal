const express = require('express');
const { registerController, loginController, logoutController, verifyController } = require('../controllers/auth.controllers');
const { createAuthMiddleware } = require('../middleware/auth.middleware');


const authRouter = express.Router();

authRouter.post('/auth/register',registerController)
authRouter.post('/auth/login',loginController)
authRouter.get('/auth/logout',logoutController)
authRouter.get('/auth/verify',createAuthMiddleware,verifyController)



module.exports = authRouter;