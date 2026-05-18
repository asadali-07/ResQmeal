const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },

  currentLocation: {
    type: {
        type: String, 
        enum: ['Point'], 
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
  },

  isAvailable: {
    type: Boolean,
      default: true,
  },

  vehicleType: {
    type: String,
    enum: ["bike", "car", "van"],
    required: true,
  },

  totalDeliveries: {
    type: Number,
    default: 0,
  },
});

volunteerSchema.index({ currentLocation: "2dsphere" });
volunteerSchema.index({ totalDeliveries: -1 });

const volunteerModel = mongoose.model("volunteers",volunteerSchema)

module.exports = volunteerModel