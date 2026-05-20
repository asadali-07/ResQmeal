const userModel = require("../models/user.model")
const jwt = require('jsonwebtoken')
const { uploadImage } = require("../services/imagekit.service")
const { sendEmail } = require("../services/email.service")
const { redis } = require("../db/redis")
const bcrypt = require('bcryptjs')


async function registerController(req, res) {
    try {
        const { name, email, password, phone, role } = req.body
        if (role && role === "admin") {
            return res.status(403).json({ message: "You are not allowed to register as admin" })
        }
        const isUserExist = await userModel.findOne({ email })
        if (!name || !email || !password || !phone || !role) {
            return res.status(400).json({ message: "All fields are required" })
        }

        if (isUserExist) {
            return res.status(400).json({ message: "User already exist,try to Login" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await userModel.create({
            name,
            email,
            password: hashedPassword,
            role,
            phone
        })
        const token = await jwt.sign(
            {
                id: user._id,
                role: user.role,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            },
            process.env.JWT_SECRET, { expiresIn: "7d" })

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        return res.status(201).json({
            message: "Registered the user Successfully",
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: user.isVerified
            }
        })
    } catch (error) {
        res.status(500).json({ message: "Error in registering the user", error: error.message })
    }
}

async function loginController(req, res) {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(400).json({
                message: "Invalid credentials"
            })
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid credentials"
            })
        }
        const token = await jwt.sign(
            {
                id: user._id,
                role: user.role,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            },
            process.env.JWT_SECRET, { expiresIn: "7d" })

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        return res.status(200).json({
            message: "LoggedIn Sucessfully",
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: user.isVerified
            }
        })
    } catch (error) {
        res.status(500).json({ message: "Error in logging in the user", error: error.message })
    }
}

async function updateProfileController(req, res) {
    try {
        const { name, phone } = req.body
        const user = await userModel.findOne({ _id: req.user.id })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
       
        if (req.file) {
            const profileImage= await uploadImage({ buffer: req.file.buffer });
            user.profileImage = profileImage;
        }
        user.name = name || user.name
        user.phone = phone || user.phone

        await user.save();
        return res.status(200).json({
            message: "Profile updated successfully",
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                role : user.role,
                profileImage: user.profileImage,
                isVerified: user.isVerified
            }

        })
    } catch (error) {
        res.status(500).json({ message: "Error in updating the profile", error: error.message })
    }
}

async function sendOTPController(req, res) {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await redis.setex(req.user.email, 300, otp)
        await sendEmail(req.user.email, "OTP for email verification", `Your OTP for email verification is ${otp}`)
        return res.status(200).json({
            message: "OTP sent to the registered email address"
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error in sending OTP", error: error.message })
    }
}

async function verifyOTPController(req, res) {
    try {
        const { otp } = req.body;
        const storedOTP = await redis.get(req.user.email)
        if (storedOTP === otp) {
            await userModel.findByIdAndUpdate(req.user.id, { isVerified: true })
            await redis.del(req.user.email)
            return res.status(200).json({
                message: "Email verified successfully"
            })
        } else {
            return res.status(400).json({
                message: "Invalid OTP"
            })
        }
    } catch (error) {
        res.status(500).json({ message: "Error in verifying OTP", error: error.message })
    }
}

async function logoutController(req, res) {
    try {
        await redis.set(`blacklist-${req.cookies.token}`, 'true', 'EX', 7 * 24 * 60 * 60)
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        })
        return res.status(200).json({
            message: "Logged out successfully"
        })
    } catch (error) {
        res.status(500).json({ message: "Error in logging out the user", error: error.message })
    }
}

async function getUserController(req, res) {
    try {
        const user = await userModel.findById(req.user.id).select("-password")
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        return res.status(200).json({
            message: "User fetched successfully",
            user
        })
    } catch (error) {
        res.status(500).json({ message: "Error in fetching the user", error: error.message })
    }
}


module.exports = {
    registerController, loginController, logoutController, getUserController, updateProfileController, sendOTPController, verifyOTPController
}