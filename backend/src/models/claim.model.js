const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "foods",
      required: true,
    },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "restaurants",
      required: true,
    },

    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ngos",
      required: true,
    },

    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "volunteers",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "picked_up",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    // 🔐 QR Tokens
    pickupToken: String,
    deliveryToken: String,

    pickupVerified: {
      type: Boolean,
      default: false,
    },

    deliveryVerified: {
      type: Boolean,
      default: false,
    },

    // ⏱ Tracking
    acceptedAt: Date,
    pickedUpAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("claims", claimSchema);