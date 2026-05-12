const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "restaurants",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    expiryTime: {
      type: Date,
      required: true,
    },

    pickupTime: {
      type: Date,
      required: true,
    },

    foodImage: {
      url: String,
      thumbnail: String,
      fileId: String,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    status: {
      type: String,
      enum: ["available","pending", "picked_up", "delivered", "expired"],
      default: "available",
    },

  },
  { timestamps: true }
);

// 📍 Geo index
foodSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("foods", foodSchema);