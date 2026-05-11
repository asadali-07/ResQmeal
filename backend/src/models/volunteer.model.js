const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  currentLocation: {
    type: {
      type: String,
      default: "Point",
    },
    coordinates: [Number],
  },

  isAvailable: {
    type: Boolean,
      default: true,
  },

  vehicleType: String,

  totalDeliveries: {
    type: Number,
    default: 0,
  },
});

volunteerSchema.index({ currentLocation: "2dsphere" });

const volunteerModel = mongoose.model("volunteers",volunteerSchema)

module.exports = volunteerModel