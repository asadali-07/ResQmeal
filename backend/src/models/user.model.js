const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    phone: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["restaurant", "ngo", "volunteer", "admin"],
      required: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    profileImage: String,

    lastActive: Date,
  },
  { timestamps: true }
);

const userModel = mongoose.model('users',userSchema)

module.exports = userModel