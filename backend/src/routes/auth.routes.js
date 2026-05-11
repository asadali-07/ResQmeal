const express = require('express');
const { registerController, loginController, logoutController, getUserController } = require('../controllers/auth.controllers');
const { createAuthMiddleware } = require('../middleware/auth.middleware');


const authRouter = express.Router();

authRouter.post('/register', registerController)
    .post('/login', loginController)
    .get('/logout', createAuthMiddleware(["restaurant", "ngo", "volunteer", "admin"]), logoutController)
    .get('/me', createAuthMiddleware(["restaurant", "ngo", "volunteer", "admin"]), getUserController)

module.exports = authRouter;