const express = require('express');
const { registerController, loginController,logoutController,getUserController, updateProfileController, sendOTPController, verifyOTPController} = require('../controllers/auth.controllers');
const {createAuthMiddleware} = require('../middlewares/auth.middleware')
const multer = require("multer");
const { get } = require('mongoose');


const upload = multer({memoryStorage: multer.memoryStorage()})  


const authRouter = express.Router();

authRouter.post('/register',registerController)
    .post('/login',loginController)
    .get('/logout',createAuthMiddleware(["restaurant", "ngo", "volunteer", "admin"]), logoutController)
    .get('/me',createAuthMiddleware(["restaurant", "ngo", "volunteer", "admin"]), getUserController)
    .patch('/update-profile',upload.single('profileImage'),createAuthMiddleware(["restaurant", "ngo", "volunteer", "admin"]), updateProfileController)
    .get('/send-otp',createAuthMiddleware(["restaurant", "ngo", "volunteer", "admin"]), sendOTPController)
    .post('/verify-otp',createAuthMiddleware(["restaurant", "ngo", "volunteer", "admin"]), verifyOTPController)

module.exports = authRouter;