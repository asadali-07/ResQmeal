const e = require("express")
const userModel = require("../models/user.model")
const jwt = require('jsonwebtoken')



async function registerController(req, res) {
    try {
        const { name, email, password, phone, role } = req.body
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
        const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, expireIn = "7d")
        res.cookie = ("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        return res.status(201).json({
            message: "Registered the user Successfully",
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
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
        const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {expiresIn : "7d"})
        res.cookie = ('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        return res.status(200).json({
            message: "LoggedIn Sucessfully",
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        })
    } catch (error) {
        res.status(500).json({ message: "Error in logging in the user", error: error.message })
    }
}

async function logoutController(req, res) {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: "strict",
        })
        return res.status(200).json({ message: "Logged out successfully" })
    } catch (error) {
        return res.status(500).json({ message: "Could not LogOut", error: error.message })
    }
}

async function verifyController ( req,res){
    try {
        const user = req.user
        return res.status(200).json({
            message : "User verified Successfully",
            user : {
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        })
    } catch (error) {
        return res.status(500).json({
            message : "Internal Server Error",
            error:
            error.message
        })
    }
}



module.exports = {
    registerController, loginController, logoutController, verifyController
}