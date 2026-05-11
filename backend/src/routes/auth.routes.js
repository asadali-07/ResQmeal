const express = require('express');
const { registerController, loginController } = require('../controllers/auth.controllers');


const authRouter = express.Router();

authRouter.post('/auth/register',registerController)
authRouter.post('/auth/login',loginController)



module.exports = authRouter;