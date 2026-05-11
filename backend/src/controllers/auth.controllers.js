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
        const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET,expireIn="7d")
        res.cookie = ("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        return res.status(201).json({
            message: "Registered the user Successfully",
            user
        })
    } catch (error) {
        res.status(500).json({ message: "Error in registering the user", error: error.message })
    }
}

module.exports = {
    registerController
}