const express = require('express');
const { registerController } = require('../controllers/auth.controllers');


const authRouter = express.Router();

authRouter.post('/auth/register',registerController)



module.exports = authRouter;